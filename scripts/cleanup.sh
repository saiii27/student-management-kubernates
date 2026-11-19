#!/usr/bin/env bash
# ==========================================================
# Teardown and Cleanup Script for Kubernetes Resources
# ==========================================================

echo "=========================================="
echo " Deleting Kubernetes Resources..."
echo "=========================================="

kubectl delete -f kubernetes/frontend-service.yaml --ignore-not-found
kubectl delete -f kubernetes/frontend-deployment.yaml --ignore-not-found
kubectl delete -f kubernetes/backend-service.yaml --ignore-not-found
kubectl delete -f kubernetes/backend-deployment.yaml --ignore-not-found
kubectl delete -f kubernetes/mysql-service.yaml --ignore-not-found
kubectl delete -f kubernetes/mysql-deployment.yaml --ignore-not-found
kubectl delete -f kubernetes/mysql-pvc.yaml --ignore-not-found
kubectl delete -f kubernetes/mysql-pv.yaml --ignore-not-found
kubectl delete -f kubernetes/mysql-secret.yaml --ignore-not-found
kubectl delete -f kubernetes/app-configmap.yaml --ignore-not-found

echo ""
echo "=========================================="
echo " [SUCCESS] All Kubernetes resources removed!"
echo "=========================================="
