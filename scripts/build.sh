#!/usr/bin/env bash
# ==========================================================
# Build Docker Images for Student Management System
# ==========================================================
set -e

echo "=========================================="
echo " 1. Building Backend Docker Image..."
echo "=========================================="
docker build -t student-backend:latest ./backend

echo ""
echo "=========================================="
echo " 2. Building Frontend Docker Image..."
echo "=========================================="
docker build -t student-frontend:latest ./frontend

echo ""
echo "=========================================="
echo " [SUCCESS] Images built successfully!"
echo "=========================================="
docker images | grep student- || true

# If using Minikube, load images into minikube cluster environment
if command -v minikube &> /dev/null && minikube status &> /dev/null; then
    echo ""
    echo ">> Minikube detected! Loading images into Minikube cluster cache..."
    minikube image load student-backend:latest
    minikube image load student-frontend:latest
    echo ">> Images loaded into Minikube!"
fi
