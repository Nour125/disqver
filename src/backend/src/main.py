import uvicorn
import uvicorn.config


UVICORN_RELOAD = True

if __name__ == "__main__":
    uvicorn.run(
        "index:app",
        host="127.0.0.1",
        port=8000,
        reload=UVICORN_RELOAD,
    )
