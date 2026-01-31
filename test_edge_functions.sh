#!/bin/bash
# Test script for FASE 7A Edge Functions
# This script provides example curl commands to test all endpoints

# Configuration
# Replace these with your actual values
SUPABASE_URL="https://your-project-ref.supabase.co"
JWT_TOKEN="your-jwt-token-here"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}FASE 7A Edge Functions Test Script${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Test 1: Obras Sociales
echo -e "${GREEN}1. Testing Obras Sociales${NC}"
echo "GET all obras sociales:"
echo "curl -X GET \"${SUPABASE_URL}/functions/v1/obras-sociales?activo=true&page=1&limit=10\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\""
echo ""

echo "POST create obra social:"
echo "curl -X POST \"${SUPABASE_URL}/functions/v1/obras-sociales\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"nombre\": \"Test Obra Social\", \"codigo\": \"TEST001\"}'"
echo ""

# Test 2: Pacientes
echo -e "${GREEN}2. Testing Pacientes${NC}"
echo "GET all pacientes:"
echo "curl -X GET \"${SUPABASE_URL}/functions/v1/pacientes?activo=true\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\""
echo ""

echo "POST create paciente:"
echo "curl -X POST \"${SUPABASE_URL}/functions/v1/pacientes\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"nombre\": \"Juan\", \"apellido\": \"Test\", \"dni\": \"99999999\"}'"
echo ""

echo "GET paciente servicios (replace {id} with actual patient ID):"
echo "curl -X GET \"${SUPABASE_URL}/functions/v1/pacientes/{id}/servicios\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\""
echo ""

# Test 3: Destinos
echo -e "${GREEN}3. Testing Destinos${NC}"
echo "GET all destinos:"
echo "curl -X GET \"${SUPABASE_URL}/functions/v1/destinos?activo=true\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\""
echo ""

echo "POST create destino:"
echo "curl -X POST \"${SUPABASE_URL}/functions/v1/destinos\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"nombre\": \"Test Hospital\", \"direccion\": \"Calle Test 123\"}'"
echo ""

# Test 4: Conductores
echo -e "${GREEN}4. Testing Conductores${NC}"
echo "GET all conductores:"
echo "curl -X GET \"${SUPABASE_URL}/functions/v1/conductores?activo=true\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\""
echo ""

echo "POST create conductor:"
echo "curl -X POST \"${SUPABASE_URL}/functions/v1/conductores\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"nombre\": \"Carlos\", \"apellido\": \"Test\", \"dni\": \"88888888\"}'"
echo ""

# Test 5: Servicios Paciente
echo -e "${GREEN}5. Testing Servicios Paciente${NC}"
echo "GET all servicios:"
echo "curl -X GET \"${SUPABASE_URL}/functions/v1/servicios-paciente?activo=true\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\""
echo ""

echo "POST create servicio (replace {paciente_id} with actual patient ID):"
echo "curl -X POST \"${SUPABASE_URL}/functions/v1/servicios-paciente\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"paciente_id\": \"{paciente_id}\", \"tipo_servicio\": \"ambulancia\", \"fecha_inicio\": \"2026-02-01\"}'"
echo ""

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Instructions:${NC}"
echo "1. Update SUPABASE_URL with your project URL"
echo "2. Get a JWT token from Supabase Auth"
echo "3. Update JWT_TOKEN variable"
echo "4. Run individual commands to test"
echo -e "${BLUE}======================================${NC}"
