import sys
import os

# Add backend directory to sys.path for Vercel Serverless Python execution
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app
