#!/usr/bin/env bash
# ==========================================================
# Comprehensive Lab Verification & Test Script
# Problem Statement 19 - Cloud Computing Lab Evaluation
# ==========================================================
set -e

echo "=========================================================="
echo " CLOUD COMPUTING LAB EVALUATION - SYSTEM VERIFICATION"
echo "=========================================================="

echo ""
echo ">>> [TEST 1: POD STATUS]"
kubectl get pods -o wide

echo ""
echo ">>> [TEST 2: DEPLOYMENT STATUS]"
kubectl get deployments

echo ""
echo ">>> [TEST 3: SERVICE STATUS]"
kubectl get services

echo ""
echo ">>> [TEST 4: ENDPOINT AVAILABILITY]"
kubectl get endpoints
kubectl get endpointslices

echo ""
echo ">>> [TEST 5: SERVICE DNS RESOLUTION]"
BACKEND_POD=$(kubectl get pod -l app=student-management,tier=backend -o jsonpath="{.items[0].metadata.name}")
echo "Inspecting DNS resolution from Backend Pod: $BACKEND_POD"
kubectl exec $BACKEND_POD -- node -e "
const dns = require('dns');
dns.lookup('mysql-service', (err, address, family) => {
  if (err) {
    console.error('DNS Lookup FAILED for mysql-service:', err);
    process.exit(1);
  }
  console.log('SUCCESS: Resolved mysql-service to IP:', address);
});
dns.lookup('backend-service', (err, address, family) => {
  if (err) {
    console.error('DNS Lookup FAILED for backend-service:', err);
    process.exit(1);
  }
  console.log('SUCCESS: Resolved backend-service to IP:', address);
});
"

echo ""
echo ">>> [TEST 6: API HEALTH CHECK]"
kubectl exec $BACKEND_POD -- node -e "
const http = require('http');
http.get('http://localhost:3000/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Health check response:', data));
});
"

echo ""
echo ">>> [TEST 7: END-TO-END CRUD THROUGH KUBERNETES SERVICE]"
echo "Creating a test student via backend service..."
kubectl exec $BACKEND_POD -- node -e "
const http = require('http');
const payload = JSON.stringify({
  name: 'Verification Bot',
  usn: 'TEST' + Date.now().toString().slice(-6),
  branch: 'Cloud Computing',
  semester: 7,
  email: 'verify@k8s.edu'
});

const req = http.request({
  hostname: 'backend-service',
  port: 3000,
  path: '/api/students',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('CREATE Response:', body);
  });
});
req.write(payload);
req.end();
"

echo ""
echo "=========================================================="
echo " Verification Script Completed Successfully!"
echo "=========================================================="
