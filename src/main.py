#!/usr/bin/env python3
"""
🐝 Urban Beekeeping Intelligence Network - Main API Server
Revolutionary AI-powered hive monitoring system
Built with love by Ace & Ren 💜✨
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
# uvicorn is imported lazily in __main__ to allow importing this module without the dependency

from .models.hive import Hive, HiveStatus, SensorReading
from .models.community import Beekeeper, PollinatorPoints
from .services.hive_monitor import HiveMonitoringService
from .services.ai_analytics import AIAnalyticsService
from .services.community import CommunityService
from .services.environmental import EnvironmentalService
from .database import DatabaseManager
from .config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global services
db_manager = DatabaseManager()
hive_service = HiveMonitoringService(db_manager)
ai_service = AIAnalyticsService()
community_service = CommunityService(db_manager)
environmental_service = EnvironmentalService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    logger.info("🐝 Starting Urban Beekeeping Intelligence Network...")
    
    # Initialize database
    await db_manager.initialize()
    
    # Start background services
    asyncio.create_task(hive_service.start_monitoring())
    asyncio.create_task(environmental_service.start_data_collection())
    
    logger.info("🚀 UBIN API Server is buzzing and ready!")
    
    yield
    
    # Cleanup
    logger.info("🛑 Shutting down UBIN services...")
    await db_manager.close()

# Create FastAPI app
app = FastAPI(
    title="Urban Beekeeping Intelligence Network",
    description="Revolutionary AI-powered hive monitoring and community platform 🐝",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API
class HiveCreateRequest(BaseModel):
    name: str = Field(..., description="Friendly name for the hive")
    location: dict = Field(..., description="GPS coordinates and address")
    beekeeper_id: str = Field(..., description="Owner's beekeeper ID")
    hive_type: str = Field(default="Langstroth", description="Type of hive")

class SensorDataRequest(BaseModel):
    hive_id: str
    sensor_type: str
    value: float
    unit: str
    timestamp: Optional[datetime] = None

class HealthPredictionResponse(BaseModel):
    hive_id: str
    health_score: float = Field(..., ge=0, le=100)
    risk_factors: List[str]
    recommendations: List[str]
    confidence: float = Field(..., ge=0, le=1)

# Health check endpoint
@app.get("/health")
async def health_check():
    """System health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "database": await db_manager.health_check(),
            "ai_models": ai_service.health_check(),
            "monitoring": hive_service.health_check()
        }
    }

# Hive Management Endpoints
@app.post("/api/v1/hives", response_model=dict)
async def create_hive(hive_data: HiveCreateRequest):
    """Register a new hive in the network"""
    try:
        hive = await hive_service.create_hive(
            name=hive_data.name,
            location=hive_data.location,
            beekeeper_id=hive_data.beekeeper_id,
            hive_type=hive_data.hive_type
        )
        logger.info(f"🐝 New hive registered: {hive.name} ({hive.id})")
        return {"hive_id": hive.id, "status": "created", "message": "Welcome to the network! 🐝"}
    except Exception as e:
        logger.error(f"Failed to create hive: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/hives/{hive_id}")
async def get_hive(hive_id: str):
    """Get detailed hive information"""
    hive = await hive_service.get_hive(hive_id)
    if not hive:
        raise HTTPException(status_code=404, detail="Hive not found")
    
    return {
        "hive": hive.dict(),
        "current_status": await hive_service.get_current_status(hive_id),
        "recent_activity": await hive_service.get_recent_activity(hive_id, hours=24)
    }

@app.get("/api/v1/hives/{hive_id}/status")
async def get_hive_status(hive_id: str):
    """Get real-time hive status"""
    status = await hive_service.get_current_status(hive_id)
    if not status:
        raise HTTPException(status_code=404, detail="Hive status not available")
    
    return status.dict()

# Sensor Data Endpoints
@app.post("/api/v1/sensor-data")
async def receive_sensor_data(data: SensorDataRequest, background_tasks: BackgroundTasks):
    """Receive sensor data from hive monitoring devices"""
    try:
        # Store sensor reading
        reading = await hive_service.store_sensor_reading(
            hive_id=data.hive_id,
            sensor_type=data.sensor_type,
            value=data.value,
            unit=data.unit,
            timestamp=data.timestamp or datetime.utcnow()
        )
        
        # Trigger background analysis
        background_tasks.add_task(
            ai_service.analyze_sensor_data,
            data.hive_id,
            data.sensor_type,
            data.value
        )
        
        return {"status": "received", "reading_id": reading.id}
    except Exception as e:
        logger.error(f"Failed to process sensor data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/hives/{hive_id}/sensors/{sensor_type}/history")
async def get_sensor_history(
    hive_id: str, 
    sensor_type: str, 
    hours: int = 24,
    limit: int = 1000
):
    """Get historical sensor data"""
    history = await hive_service.get_sensor_history(
        hive_id=hive_id,
        sensor_type=sensor_type,
        hours=hours,
        limit=limit
    )
    
    return {
        "hive_id": hive_id,
        "sensor_type": sensor_type,
        "readings": [reading.dict() for reading in history],
        "summary": await hive_service.get_sensor_summary(hive_id, sensor_type, hours)
    }

# AI Analytics Endpoints
@app.get("/api/v1/hives/{hive_id}/health-prediction", response_model=HealthPredictionResponse)
async def get_health_prediction(hive_id: str):
    """Get AI-powered hive health prediction"""
    try:
        prediction = await ai_service.predict_hive_health(hive_id)
        return prediction
    except Exception as e:
        logger.error(f"Health prediction failed for hive {hive_id}: {e}")
        raise HTTPException(status_code=500, detail="Health prediction unavailable")

@app.get("/api/v1/hives/{hive_id}/population-estimate")
async def get_population_estimate(hive_id: str):
    """Get current bee population estimate"""
    try:
        estimate = await ai_service.estimate_population(hive_id)
        return {
            "hive_id": hive_id,
            "estimated_population": estimate.population,
            "confidence": estimate.confidence,
            "method": estimate.method,
            "timestamp": estimate.timestamp
        }
    except Exception as e:
        logger.error(f"Population estimation failed for hive {hive_id}: {e}")
        raise HTTPException(status_code=500, detail="Population estimate unavailable")

@app.get("/api/v1/hives/{hive_id}/honey-forecast")
async def get_honey_forecast(hive_id: str, days: int = 30):
    """Get honey production forecast"""
    try:
        forecast = await ai_service.forecast_honey_production(hive_id, days)
        return {
            "hive_id": hive_id,
            "forecast_days": days,
            "predicted_production": forecast.production_kg,
            "confidence_interval": forecast.confidence_interval,
            "factors": forecast.influencing_factors
        }
    except Exception as e:
        logger.error(f"Honey forecast failed for hive {hive_id}: {e}")
        raise HTTPException(status_code=500, detail="Honey forecast unavailable")

# Community Endpoints
@app.get("/api/v1/community/leaderboard")
async def get_pollinator_points_leaderboard(limit: int = 50):
    """Get Pollinator Points leaderboard"""
    leaderboard = await community_service.get_leaderboard(limit)
    return {
        "leaderboard": leaderboard,
        "updated_at": datetime.utcnow()
    }

@app.post("/api/v1/community/share-knowledge")
async def share_knowledge(
    beekeeper_id: str,
    title: str,
    content: str,
    tags: List[str] = []
):
    """Share beekeeping knowledge and earn Pollinator Points"""
    try:
        post = await community_service.create_knowledge_post(
            beekeeper_id=beekeeper_id,
            title=title,
            content=content,
            tags=tags
        )
        
        # Award Pollinator Points
        points = await community_service.award_points(
            beekeeper_id=beekeeper_id,
            points=10,
            reason="Knowledge sharing"
        )
        
        return {
            "post_id": post.id,
            "points_awarded": points,
            "message": "Thank you for sharing your wisdom! 🐝"
        }
    except Exception as e:
        logger.error(f"Knowledge sharing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Environmental Data Endpoints
@app.get("/api/v1/environmental/{location}")
async def get_environmental_data(location: str):
    """Get environmental data for a location"""
    try:
        data = await environmental_service.get_location_data(location)
        return {
            "location": location,
            "air_quality": data.air_quality,
            "weather": data.weather,
            "bloom_calendar": data.bloom_calendar,
            "pollution_sources": data.pollution_sources
        }
    except Exception as e:
        logger.error(f"Environmental data fetch failed for {location}: {e}")
        raise HTTPException(status_code=500, detail="Environmental data unavailable")

# WebSocket endpoint for real-time updates
@app.websocket("/ws/hive/{hive_id}")
async def websocket_hive_updates(websocket, hive_id: str):
    """WebSocket endpoint for real-time hive updates"""
    await websocket.accept()
    
    try:
        # Subscribe to hive updates
        async for update in hive_service.subscribe_to_updates(hive_id):
            await websocket.send_json(update)
    except Exception as e:
        logger.error(f"WebSocket error for hive {hive_id}: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn  # local import to avoid hard dependency at import time
    uvicorn.run(
        "bees.src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
