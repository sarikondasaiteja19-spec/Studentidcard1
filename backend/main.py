"""
Smart Student ID Generator Pro – 2026 Edition
FastAPI Backend Application
Intended for Diploma Final Year CSE Project
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="Smart Student ID Generator Pro API",
    version="2026.1.0",
    description="REST backend for Student ID card management, generation, and QR verification."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "project": "Smart Student ID Generator Pro – 2026 Edition",
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "FastAPI Student ID Service"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
