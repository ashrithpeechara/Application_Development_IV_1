import uuid
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import NetworkDevice, NetworkConnection, AutonomicAgent, BRSKIVoucher, AuditLogEvent
from .serializers import (
    NetworkDeviceSerializer,
    NetworkConnectionSerializer,
    AutonomicAgentSerializer,
    BRSKIVoucherSerializer,
    AuditLogEventSerializer
)
from .simulation_engine import simulation_engine


# --- SIMULATION STATE & CONTROL VIEWS ---

class SimulationStateView(APIView):
    def get(self, request):
        return Response(simulation_engine.get_current_state(), status=status.HTTP_200_OK)


class AgentsView(APIView):
    def get(self, request):
        return Response(simulation_engine.get_agents(), status=status.HTTP_200_OK)


class NetworkTopologyView(APIView):
    def get(self, request):
        return Response(simulation_engine.get_network_topology(), status=status.HTTP_200_OK)


class TelemetryView(APIView):
    def get(self, request):
        return Response({
            "current": simulation_engine.get_telemetry(),
            "history": simulation_engine.telemetry_history
        }, status=status.HTTP_200_OK)


class EventsView(APIView):
    def get(self, request):
        return Response(simulation_engine.events, status=status.HTTP_200_OK)


class A2AView(APIView):
    def get(self, request):
        return Response(simulation_engine.get_a2a_messages(), status=status.HTTP_200_OK)


class CognitiveWorkflowView(APIView):
    def get(self, request):
        return Response(simulation_engine.get_cognitive_workflow(), status=status.HTTP_200_OK)


class StartSimulationView(APIView):
    def post(self, request):
        phase = request.data.get("phase", "NORMAL")
        simulation_engine.set_phase(phase)
        return Response(simulation_engine.get_current_state(), status=status.HTTP_200_OK)


class AnomalyTriggerView(APIView):
    def post(self, request):
        anomaly_type = request.data.get("type", "TRAFFIC_SPIKE")
        state = simulation_engine.trigger_anomaly(anomaly_type=anomaly_type)
        return Response(state, status=status.HTTP_200_OK)


class NodeFailureTriggerView(APIView):
    def post(self, request):
        state = simulation_engine.trigger_node_failure()
        return Response(state, status=status.HTTP_200_OK)


class ResetSimulationView(APIView):
    def post(self, request):
        simulation_engine.reset()
        return Response(simulation_engine.get_current_state(), status=status.HTTP_200_OK)


class StepSimulationView(APIView):
    def post(self, request):
        direction = request.data.get("direction", "next")
        if direction == "prev":
            state = simulation_engine.prev_step()
        else:
            state = simulation_engine.next_step()
        return Response(state, status=status.HTTP_200_OK)


class SetPhaseView(APIView):
    def post(self, request):
        phase = request.data.get("phase")
        if phase and phase in simulation_engine.PHASES:
            simulation_engine.set_phase(phase)
        return Response(simulation_engine.get_current_state(), status=status.HTTP_200_OK)


# --- DYNAMIC DEVICE PROVISIONING VIEWS ---

class DeviceListView(APIView):
    def get(self, request):
        devices = NetworkDevice.objects.all()
        serializer = NetworkDeviceSerializer(devices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        node_id = data.get('node_id') or data.get('id') or f"node-{uuid.uuid4().hex[:4]}"
        name = data.get('name', f"Device {node_id.upper()}")
        device_type = data.get('device_type') or data.get('type') or 'router'
        ip_address = data.get('ip_address') or data.get('ip') or '10.0.5.1'
        port_capacity = data.get('port_capacity', '10.0 Gbps')
        initial_status = data.get('status', 'ONLINE')
        load = int(data.get('load', 15))
        link_target = data.get('link_target', 'r1')

        device, created = NetworkDevice.objects.update_or_create(
            node_id=node_id.lower(),
            defaults={
                'name': name,
                'device_type': device_type,
                'ip_address': ip_address,
                'port_capacity': port_capacity,
                'status': initial_status,
                'load': load,
                'is_custom': True
            }
        )

        # Create link connection if target exists
        if link_target:
            try:
                target_dev = NetworkDevice.objects.get(node_id=link_target.lower())
                link_id = f"link-{device.node_id}-{target_dev.node_id}"
                NetworkConnection.objects.get_or_create(
                    link_id=link_id,
                    defaults={
                        'source': target_dev,
                        'target': device,
                        'link_type': 'normal',
                        'traffic_level': 'low'
                    }
                )
            except NetworkDevice.DoesNotExist:
                pass

        # Log event
        AuditLogEvent.objects.create(
            event_id=f"ev-prov-{uuid.uuid4().hex[:6]}",
            timestamp=datetime.now().strftime("%H:%M:%S"),
            level="SUCCESS",
            source="Admin Plane",
            phase="PROVISIONING",
            title=f"Node Provisioned: {name}",
            message=f"Device [{node_id.upper()}] with IP {ip_address} successfully registered and connected to {link_target.upper()}."
        )

        serializer = NetworkDeviceSerializer(device)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DeviceDetailView(APIView):
    def delete(self, request, node_id):
        try:
            device = NetworkDevice.objects.get(node_id=node_id.lower())
            device_name = device.name
            device.delete()

            AuditLogEvent.objects.create(
                event_id=f"ev-decom-{uuid.uuid4().hex[:6]}",
                timestamp=datetime.now().strftime("%H:%M:%S"),
                level="WARNING",
                source="Admin Plane",
                phase="DECOMMISSION",
                title=f"Node Decommissioned: {device_name}",
                message=f"Device [{node_id.upper()}] has been removed from the SDN active plane."
            )
            return Response({"status": "DELETED", "node_id": node_id}, status=status.HTTP_200_OK)
        except NetworkDevice.DoesNotExist:
            return Response({"error": "Device not found"}, status=status.HTTP_404_NOT_FOUND)


# --- BRSKI RFC 8995 ONBOARDING VIEWS ---

class BRSKIVoucherRequestView(APIView):
    """
    POST /api/brski/voucher-request/
    Handles RFC 8995 MASA Voucher Ticket Generation & Signing.
    """
    def post(self, request):
        serial_number = request.data.get("serial_number", f"SN-ANIMA-8995-{uuid.uuid4().hex[:4].upper()}")
        pledge_id = request.data.get("pledge_id", "r5")
        nonce = uuid.uuid4().hex[:8].upper()

        voucher_data = {
            "ietf-voucher:voucher": {
                "voucher-version": "1.0",
                "created-on": datetime.utcnow().isoformat() + "Z",
                "expires-on": (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z",
                "serial-number": serial_number,
                "pinned-domain-cert": "SHA256:7B:3A:9F:88:C1:4E:02:D5:A6",
                "domain-registrar": "casa-autonomic-registrar.domain.net",
                "nonce": nonce,
                "masa-signature-algorithm": "ECDSA-SHA256",
                "masa-url": "https://masa.anima-auth.org/vouchers"
            }
        }

        # Store in DB
        voucher = BRSKIVoucher.objects.create(
            serial_number=serial_number,
            nonce=nonce,
            masa_signature=f"SIG-ECDSA-{uuid.uuid4().hex.upper()}",
            expires_at=datetime.utcnow() + timedelta(days=1),
            status="VOUCHER_ISSUED"
        )

        AuditLogEvent.objects.create(
            event_id=f"ev-brski-vch-{uuid.uuid4().hex[:6]}",
            timestamp=datetime.now().strftime("%H:%M:%S"),
            level="SUCCESS",
            source="MASA Authority",
            phase="BRSKI_VOUCHER",
            title=f"MASA Voucher Ticket Issued: {serial_number}",
            message=f"Ownership validated for pledge {pledge_id.upper()} with Nonce {nonce}. RFC 8366 ticket generated.",
            payload=voucher_data
        )

        return Response(voucher_data, status=status.HTTP_200_OK)


class BRSKIESTEnrollView(APIView):
    """
    POST /api/brski/est-enroll/
    Handles RFC 7030 EST Domain Certificate (LDevID) Enrollment.
    """
    def post(self, request):
        pledge_id = request.data.get("pledge_id", "r5").lower()
        pledge_name = request.data.get("pledge_name", f"Router {pledge_id.upper()} (BRSKI Onboarded)")
        serial_number = request.data.get("serial_number", "SN-ANIMA-8995-0984-X")
        proxy_id = request.data.get("proxy_id", "r1").lower()

        ldevid_cert = {
            "x509_certificate": {
                "subject": f"CN={pledge_id}.casa.autonomic.net, OU=Autonomic ACP, O=C-ASA Domain",
                "issuer": "CN=C-ASA Root CA, O=Autonomic Networking Authority",
                "serial_number": f"0x{uuid.uuid4().hex[:8].upper()}",
                "valid_from": datetime.utcnow().strftime("%Y-%m-%d"),
                "valid_until": (datetime.utcnow() + timedelta(days=365)).strftime("%Y-%m-%d"),
                "key_usage": ["Digital Signature", "Key Encipherment", "ACP Tunnel Auth"],
                "status": "VALIDATED_AND_ENROLLED"
            }
        }

        # Provision node in DB
        device, _ = NetworkDevice.objects.update_or_create(
            node_id=pledge_id,
            defaults={
                'name': pledge_name,
                'device_type': 'router',
                'ip_address': f"10.0.{NetworkDevice.objects.count() + 2}.1",
                'status': 'PROTECTED',
                'load': 12,
                'is_custom': True
            }
        )

        # Connect link to Join Proxy
        try:
            proxy_dev = NetworkDevice.objects.get(node_id=proxy_id)
            NetworkConnection.objects.get_or_create(
                link_id=f"link-{pledge_id}-{proxy_id}",
                defaults={
                    'source': proxy_dev,
                    'target': device,
                    'link_type': 'normal',
                    'traffic_level': 'low'
                }
            )
        except NetworkDevice.DoesNotExist:
            pass

        AuditLogEvent.objects.create(
            event_id=f"ev-brski-est-{uuid.uuid4().hex[:6]}",
            timestamp=datetime.now().strftime("%H:%M:%S"),
            level="SUCCESS",
            source="EST Registrar",
            phase="LDEVID_ENROLLMENT",
            title=f"LDevID Domain Cert Enrolled: {pledge_name}",
            message=f"Pledge [{pledge_id.upper()}] converted into fully trusted Autonomic Node. ACP IPv6 tunnels established.",
            payload=ldevid_cert
        )

        return Response({
            "status": "ENROLLED_AND_TRUSTED",
            "device": NetworkDeviceSerializer(device).data,
            "certificate": ldevid_cert
        }, status=status.HTTP_200_OK)


# --- AUDIT LOGS VIEW ---

class AuditLogsListView(APIView):
    def get(self, request):
        query = request.query_params.get('search', '')
        level = request.query_params.get('level', '')
        source = request.query_params.get('source', '')

        logs = AuditLogEvent.objects.all()
        if level and level != 'ALL':
            logs = logs.filter(level__iexact=level)
        if source and source != 'ALL':
            logs = logs.filter(source__icontains=source)
        if query:
            logs = logs.filter(
                Q(title__icontains=query) |
                Q(message__icontains=query) |
                Q(event_id__icontains=query)
            )

        serializer = AuditLogEventSerializer(logs[:100], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# --- C-ASA PRIVATE COGNITIVE REASONING MODEL INTEGRATION ---

from .private_model_service import call_private_model, analyze_incident_cognitive, copilot_chat_response, DISPLAY_MODEL_NAME

class PrivateModelGenerateView(APIView):
    """
    Accepts raw prompts or standard inference payloads and forwards to the private cognitive model.
    """
    def post(self, request):
        prompt = ""
        if "contents" in request.data:
            try:
                prompt = request.data["contents"][0]["parts"][0]["text"]
            except Exception:
                prompt = str(request.data["contents"])
        elif "prompt" in request.data:
            prompt = request.data.get("prompt", "")
        else:
            prompt = request.data.get("text", "Provide an overview of autonomic network self-healing.")

        system_prompt = request.data.get("system_prompt", None)
        result = call_private_model(prompt, system_prompt=system_prompt)
        
        if result.get("success"):
            return Response({
                "status": "SUCCESS",
                "model": result.get("model", DISPLAY_MODEL_NAME),
                "text": result.get("text"),
                "candidates": result.get("raw", {}).get("candidates", [])
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "status": "ERROR",
                "error": result.get("error")
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrivateModelCognitiveAnalyzeView(APIView):
    """
    Synthesizes live C-ASA Cognitive Reasoning & Root Cause Analysis for current network state.
    """
    def post(self, request):
        telemetry = request.data.get("telemetry") or simulation_engine.get_telemetry()
        phase = request.data.get("phase") or simulation_engine.current_phase
        phase_data = request.data.get("phase_data") or simulation_engine.PHASE_METADATA.get(phase, {})

        result = analyze_incident_cognitive(telemetry, phase, phase_data)
        return Response(result, status=status.HTTP_200_OK if result.get("success") else status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrivateModelCopilotChatView(APIView):
    """
    Interactive NOC AI Copilot query handler with live network state awareness.
    """
    def post(self, request):
        query = request.data.get("query") or request.data.get("message", "")
        if not query:
            return Response({"error": "Query string is required."}, status=status.HTTP_400_BAD_REQUEST)

        current_state = simulation_engine.get_current_state()
        history = request.data.get("history", [])

        result = copilot_chat_response(query, current_state, history)
        return Response(result, status=status.HTTP_200_OK if result.get("success") else status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrivateModelStatusView(APIView):
    """
    Returns private model service health & architecture details.
    """
    def get(self, request):
        return Response({
            "status": "ONLINE",
            "provider": "C-ASA Enterprise Neural Reasoning Core",
            "active_model": DISPLAY_MODEL_NAME,
            "architecture": "Transformer Autonomic Reasoner",
            "version": "v3.2"
        }, status=status.HTTP_200_OK)


