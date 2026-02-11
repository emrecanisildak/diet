#!/bin/bash

trap 'kill 0; exit' SIGINT SIGTERM

echo "Backend baslatiliyor..."
cd backend && source venv/bin/activate && uvicorn app.main:app --reload &

echo "Admin panel baslatiliyor..."
cd admin && npm run dev &

wait
