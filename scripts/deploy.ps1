# ==========================================================
# PowerShell Deploy Script for Windows Users
# ==========================================================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " 1. Applying ConfigMaps & Secrets..." -ForegroundColor Yellow
kubectl apply -f kubernetes/app-configmap.yaml
kubectl apply -f kubernetes/mysql-secret.yaml

Write-Host "`n 2. Applying Persistent Storage (PV & PVC)..." -ForegroundColor Yellow
kubectl apply -f kubernetes/mysql-pv.yaml
kubectl apply -f kubernetes/mysql-pvc.yaml

Write-Host "`n 3. Deploying MySQL Database Tier..." -ForegroundColor Yellow
kubectl apply -f kubernetes/mysql-deployment.yaml
kubectl apply -f kubernetes/mysql-service.yaml

Write-Host "Waiting for MySQL Pod..." -ForegroundColor Gray
kubectl rollout status deployment/mysql-deployment --timeout=180s

Write-Host "`n 4. Deploying Backend API Tier..." -ForegroundColor Yellow
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml

Write-Host "Waiting for Backend Pods..." -ForegroundColor Gray
kubectl rollout status deployment/backend-deployment --timeout=120s

Write-Host "`n 5. Deploying Frontend Tier..." -ForegroundColor Yellow
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml

Write-Host "Waiting for Frontend Pod..." -ForegroundColor Gray
kubectl rollout status deployment/frontend-deployment --timeout=120s

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " [SUCCESS] All 3 Tiers Deployed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
kubectl get pods -o wide
Write-Host ""
kubectl get svc
