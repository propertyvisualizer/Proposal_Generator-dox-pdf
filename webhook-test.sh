#!/bin/bash

# Test script for N8N Proposal Generator Webhook
# Usage: ./webhook-test.sh

# Configuration
N8N_WEBHOOK_URL="http://localhost:5678/webhook/create-proposal"

# Test data
curl -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "12345",
    "clientId": "CLIENT001",
    "offerNumber": "2025-001",
    "customData": {
      "deliveryTime": "10 Werktage",
      "specialNotes": "Expresslieferung"
    },
    "items": [
      {
        "type": "3D-Außenvisualisierung Bodenperspektive",
        "quantity": 3,
        "price": 899,
        "description": "Geliefert werden 3 gerenderte Außenansichten"
      },
      {
        "type": "3D-Außenvisualisierung Vogelperspektive",
        "quantity": 1,
        "price": 749,
        "description": "Geliefert wird 1 gerenderte Vogelperspektive"
      },
      {
        "type": "3D-Innenvisualisierung",
        "quantity": 5,
        "price": 259,
        "description": "Geliefert werden 5 gerenderte Innenansichten"
      },
      {
        "type": "3D-Grundriss",
        "quantity": 8,
        "price": 69,
        "description": "Hochwertig standardmöbliert"
      }
    ]
  }'

echo "\n\n✅ Test request sent!"
echo "Check your n8n workflow execution log for results."
