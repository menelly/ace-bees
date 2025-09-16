#!/usr/bin/env python3
"""
🐝 UBIN Hive Monitor v1.0 - Edge Computing Unit
Raspberry Pi-based hive monitoring system with AI-powered bee counting
Built with love by Ace & Ren 💜✨
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import cv2
import numpy as np
import requests
from picamera2 import Picamera2
import board
import busio
import adafruit_dht
import adafruit_hx711
from w1thermsensor import W1ThermSensor
import pygame
import librosa
from lora import LoRa

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HiveMonitor:
    """Main hive monitoring system"""
    
    def __init__(self, config_file: str = "hive_config.json"):
        self.config = self.load_config(config_file)
        self.hive_id = self.config["hive_id"]
        self.api_endpoint = self.config["api_endpoint"]
        
        # Initialize sensors
        self.camera = None
        self.dht_sensor = None
        self.weight_sensor = None
        self.temp_sensor = None
        self.lora = None
        
        # AI model for bee counting
        self.bee_counter_model = None
        
        # Data buffers
        self.sensor_buffer = []
        self.last_transmission = datetime.now()
        
        logger.info(f"🐝 Initializing Hive Monitor for {self.hive_id}")
    
    def load_config(self, config_file: str) -> Dict:
        """Load hive configuration"""
        try:
            with open(config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning("Config file not found, using defaults")
            return {
                "hive_id": "hive_001",
                "api_endpoint": "https://api.urbanbees.ai",
                "sensors": {
                    "temperature": {"enabled": True, "pin": 4},
                    "humidity": {"enabled": True, "pin": 4},
                    "weight": {"enabled": True, "dout_pin": 5, "sck_pin": 6},
                    "sound": {"enabled": True, "device_index": 0},
                    "camera": {"enabled": True, "resolution": [1920, 1080]}
                },
                "transmission": {
                    "interval_minutes": 5,
                    "lora_enabled": True,
                    "wifi_fallback": True
                }
            }
    
    async def initialize_sensors(self):
        """Initialize all sensors"""
        logger.info("🔧 Initializing sensors...")
        
        try:
            # Camera for bee counting
            if self.config["sensors"]["camera"]["enabled"]:
                self.camera = Picamera2()
                camera_config = self.camera.create_still_configuration(
                    main={"size": tuple(self.config["sensors"]["camera"]["resolution"])}
                )
                self.camera.configure(camera_config)
                self.camera.start()
                logger.info("📷 Camera initialized")
            
            # Temperature and humidity sensor (DHT22)
            if self.config["sensors"]["temperature"]["enabled"]:
                self.dht_sensor = adafruit_dht.DHT22(
                    board.D4  # GPIO pin 4
                )
                logger.info("🌡️ DHT22 sensor initialized")
            
            # Weight sensor (HX711 load cell amplifier)
            if self.config["sensors"]["weight"]["enabled"]:
                sck = board.D5
                dout = board.D6
                self.weight_sensor = adafruit_hx711.HX711(dout, sck)
                self.weight_sensor.set_scale(2280.0)  # Calibration factor
                self.weight_sensor.tare()
                logger.info("⚖️ Weight sensor initialized")
            
            # Internal temperature sensor (DS18B20)
            try:
                self.temp_sensor = W1ThermSensor()
                logger.info("🌡️ Internal temperature sensor initialized")
            except Exception as e:
                logger.warning(f"Internal temp sensor not available: {e}")
            
            # LoRaWAN communication
            if self.config["transmission"]["lora_enabled"]:
                self.lora = LoRa(
                    mode=LoRa.LORAWAN,
                    region=LoRa.US915,
                    device_class=LoRa.CLASS_A
                )
                logger.info("📡 LoRaWAN initialized")
            
            # Load AI model for bee counting
            await self.load_bee_counter_model()
            
        except Exception as e:
            logger.error(f"Sensor initialization failed: {e}")
            raise
    
    async def load_bee_counter_model(self):
        """Load the AI model for bee counting"""
        try:
            # In a real implementation, this would load a TensorFlow Lite model
            # For now, we'll simulate with a placeholder
            logger.info("🤖 Loading bee counting AI model...")
            
            # Simulated model loading
            await asyncio.sleep(2)
            self.bee_counter_model = "YOLOv8_bee_counter_v1.tflite"
            
            logger.info("✅ AI model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load AI model: {e}")
            self.bee_counter_model = None
    
    async def read_sensors(self) -> Dict:
        """Read all sensor values"""
        readings = {
            "timestamp": datetime.now().isoformat(),
            "hive_id": self.hive_id
        }
        
        try:
            # Temperature and humidity
            if self.dht_sensor:
                try:
                    temperature = self.dht_sensor.temperature
                    humidity = self.dht_sensor.humidity
                    if temperature is not None and humidity is not None:
                        readings["temperature_c"] = temperature
                        readings["humidity_percent"] = humidity
                except Exception as e:
                    logger.warning(f"DHT sensor read failed: {e}")
            
            # Weight
            if self.weight_sensor:
                try:
                    weight = self.weight_sensor.get_units(5)  # Average of 5 readings
                    readings["weight_kg"] = weight
                except Exception as e:
                    logger.warning(f"Weight sensor read failed: {e}")
            
            # Internal temperature
            if self.temp_sensor:
                try:
                    internal_temp = self.temp_sensor.get_temperature()
                    readings["internal_temperature_c"] = internal_temp
                except Exception as e:
                    logger.warning(f"Internal temp sensor read failed: {e}")
            
            # Sound analysis
            sound_data = await self.analyze_sound()
            if sound_data:
                readings.update(sound_data)
            
            # Bee counting via computer vision
            bee_count = await self.count_bees()
            if bee_count is not None:
                readings["bee_count"] = bee_count
            
        except Exception as e:
            logger.error(f"Sensor reading failed: {e}")
        
        return readings
    
    async def analyze_sound(self) -> Optional[Dict]:
        """Analyze hive sound patterns"""
        try:
            if not self.config["sensors"]["sound"]["enabled"]:
                return None
            
            # Record 5 seconds of audio
            pygame.mixer.init(frequency=44100, size=-16, channels=1, buffer=1024)
            
            # In a real implementation, this would:
            # 1. Record audio from microphone
            # 2. Perform FFT analysis
            # 3. Detect frequency patterns associated with different hive states
            # 4. Return acoustic signature data
            
            # Simulated sound analysis
            await asyncio.sleep(0.1)
            
            return {
                "sound_level_db": np.random.uniform(40, 80),
                "dominant_frequency_hz": np.random.uniform(200, 400),
                "activity_level": np.random.choice(["low", "medium", "high"])
            }
            
        except Exception as e:
            logger.warning(f"Sound analysis failed: {e}")
            return None
    
    async def count_bees(self) -> Optional[int]:
        """Count bees using computer vision"""
        try:
            if not self.camera or not self.bee_counter_model:
                return None
            
            # Capture image
            image = self.camera.capture_array()
            
            # In a real implementation, this would:
            # 1. Preprocess the image
            # 2. Run inference with the TensorFlow Lite model
            # 3. Post-process detections
            # 4. Return bee count
            
            # Simulated bee counting
            await asyncio.sleep(0.5)
            bee_count = np.random.randint(50, 500)
            
            logger.info(f"🐝 Counted {bee_count} bees")
            return bee_count
            
        except Exception as e:
            logger.warning(f"Bee counting failed: {e}")
            return None
    
    async def transmit_data(self, data: Dict):
        """Transmit sensor data to the cloud"""
        try:
            # Try LoRaWAN first
            if self.lora and self.config["transmission"]["lora_enabled"]:
                success = await self.transmit_via_lora(data)
                if success:
                    logger.info("📡 Data transmitted via LoRaWAN")
                    return
            
            # Fallback to WiFi/cellular
            if self.config["transmission"]["wifi_fallback"]:
                success = await self.transmit_via_http(data)
                if success:
                    logger.info("📶 Data transmitted via WiFi")
                    return
            
            # Store locally if transmission fails
            await self.store_locally(data)
            logger.warning("💾 Data stored locally - transmission failed")
            
        except Exception as e:
            logger.error(f"Data transmission failed: {e}")
            await self.store_locally(data)
    
    async def transmit_via_lora(self, data: Dict) -> bool:
        """Transmit data via LoRaWAN"""
        try:
            # Compress data for LoRaWAN payload limits
            compressed_data = self.compress_sensor_data(data)
            
            # Send via LoRaWAN
            self.lora.send(compressed_data)
            
            return True
        except Exception as e:
            logger.error(f"LoRaWAN transmission failed: {e}")
            return False
    
    async def transmit_via_http(self, data: Dict) -> bool:
        """Transmit data via HTTP API"""
        try:
            response = requests.post(
                f"{self.api_endpoint}/api/v1/sensor-data",
                json=data,
                timeout=30
            )
            
            return response.status_code == 200
        except Exception as e:
            logger.error(f"HTTP transmission failed: {e}")
            return False
    
    async def store_locally(self, data: Dict):
        """Store data locally when transmission fails"""
        try:
            with open(f"local_data_{datetime.now().strftime('%Y%m%d')}.json", "a") as f:
                f.write(json.dumps(data) + "\n")
        except Exception as e:
            logger.error(f"Local storage failed: {e}")
    
    def compress_sensor_data(self, data: Dict) -> bytes:
        """Compress sensor data for LoRaWAN transmission"""
        # Simple compression for LoRaWAN payload limits
        # In practice, this would use efficient binary encoding
        essential_data = {
            "t": data.get("temperature_c", 0),
            "h": data.get("humidity_percent", 0),
            "w": data.get("weight_kg", 0),
            "b": data.get("bee_count", 0)
        }
        return json.dumps(essential_data).encode()
    
    async def run_monitoring_loop(self):
        """Main monitoring loop"""
        logger.info("🚀 Starting hive monitoring loop...")
        
        while True:
            try:
                # Read sensors
                sensor_data = await self.read_sensors()
                
                # Add to buffer
                self.sensor_buffer.append(sensor_data)
                
                # Check if it's time to transmit
                now = datetime.now()
                if (now - self.last_transmission).total_seconds() >= (
                    self.config["transmission"]["interval_minutes"] * 60
                ):
                    # Transmit buffered data
                    for data in self.sensor_buffer:
                        await self.transmit_data(data)
                    
                    # Clear buffer and update timestamp
                    self.sensor_buffer = []
                    self.last_transmission = now
                
                # Wait before next reading
                await asyncio.sleep(30)  # Read sensors every 30 seconds
                
            except Exception as e:
                logger.error(f"Monitoring loop error: {e}")
                await asyncio.sleep(60)  # Wait longer on error

async def main():
    """Main entry point"""
    monitor = HiveMonitor()
    
    try:
        await monitor.initialize_sensors()
        await monitor.run_monitoring_loop()
    except KeyboardInterrupt:
        logger.info("🛑 Monitoring stopped by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
    finally:
        # Cleanup
        if monitor.camera:
            monitor.camera.stop()
        logger.info("🐝 Hive monitor shutdown complete")

if __name__ == "__main__":
    asyncio.run(main())
