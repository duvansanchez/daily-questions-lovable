#!/usr/bin/env python
"""Test simple sin dependencias complejas."""
import sys
print("Python started")
sys.stdout.flush()

try:
    from fastapi import FastAPI
    print("FastAPI imported")
    sys.stdout.flush()
    
    app = FastAPI()
    print("FastAPI app created")
    sys.stdout.flush()
    
    @app.get("/test")
    def test():
        return {"status": "ok"}
    
    print("Route defined")
    sys.stdout.flush()
    
    if __name__ == "__main__":
        import uvicorn
        print("Starting server...")
        sys.stdout.flush()
        uvicorn.run(app, host="0.0.0.0", port=3001)
        
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
