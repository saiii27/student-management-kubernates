#!/usr/bin/env bash
# ==========================================================
# Deploy Student Management System to Kubernetes
# ==========================================================
set -e

echo "=========================================="
echo " 1. Applying ConfigMaps & Secrets..."
echo "=========================================="
kubectl apply -f kubernetes/app-configmap.yaml
kubectl apply -f kubernetes/mysql-secret.yaml

echo ""
echo "=========================================="
echo " 2. Applying Persistent Storage (PV & PVC)..."
echo "=========================================="
kubectl apply -f kubernetes/mysql-pv.yaml
kubectl apply -f kubernetes/mysql-pvc.yaml

echo ""
echo "=========================================="
echo " 3. Deploying MySQL Database Tier..."
echo "=========================================="
kubectl apply -f kubernetes/mysql-deployment.yaml
kubectl apply -f kubernetes/mysql-service.yaml

echo ">> Waiting for MySQL Pod to be Ready..."
kubectl rollout status deployment/mysql-deployment --timeout=180s

echo ""
echo "=========================================="
echo " 4. Deploying Backend API Tier..."
echo "=========================================="
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml

echo ">> Waiting for Backend Pods to be Ready..."
kubectl rollout status deployment/backend-deployment --timeout=120s

echo ""
echo "=========================================="
echo " 5. Deploying Frontend Tier..."
echo "=========================================="
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml

echo ">> Waiting for Frontend Pod to be Ready..."
kubectl rollout status deployment/frontend-deployment --timeout=120s

echo ""
echo "=========================================="
echo " [SUCCESS] All 3 Tiers Deployed!"
echo "=========================================="
kubectl get pods -o wide
echo ""
kubectl get svc
