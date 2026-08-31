from django.urls import path
from .views import (
    SimulationStateView,
    AgentsView,
    NetworkTopologyView,
    TelemetryView,
    EventsView,
    A2AView,
    CognitiveWorkflowView,
    StartSimulationView,
    AnomalyTriggerView,
    NodeFailureTriggerView,
    ResetSimulationView,
    StepSimulationView,
    SetPhaseView,
    DeviceListView,
    DeviceDetailView,
    BRSKIVoucherRequestView,
    BRSKIESTEnrollView,
    AuditLogsListView,
    PrivateModelGenerateView,
    PrivateModelCognitiveAnalyzeView,
    PrivateModelCopilotChatView,
    PrivateModelStatusView
)

urlpatterns = [
    # Simulation Core Endpoints
    path('simulation/state/', SimulationStateView.as_view(), name='simulation-state'),
    path('simulation/agents/', AgentsView.as_view(), name='simulation-agents'),
    path('simulation/network/', NetworkTopologyView.as_view(), name='simulation-network'),
    path('simulation/telemetry/', TelemetryView.as_view(), name='simulation-telemetry'),
    path('simulation/events/', EventsView.as_view(), name='simulation-events'),
    path('simulation/a2a/', A2AView.as_view(), name='simulation-a2a'),
    path('simulation/cognitive/', CognitiveWorkflowView.as_view(), name='simulation-cognitive'),
    path('simulation/start/', StartSimulationView.as_view(), name='simulation-start'),
    path('simulation/anomaly/', AnomalyTriggerView.as_view(), name='simulation-anomaly'),
    path('simulation/node-failure/', NodeFailureTriggerView.as_view(), name='simulation-node-failure'),
    path('simulation/reset/', ResetSimulationView.as_view(), name='simulation-reset'),
    path('simulation/step/', StepSimulationView.as_view(), name='simulation-step'),
    path('simulation/phase/', SetPhaseView.as_view(), name='simulation-phase'),

    # Private Cognitive Neural Model Endpoints
    path('simulation/private-model/generate/', PrivateModelGenerateView.as_view(), name='private-model-generate'),
    path('simulation/private-model/analyze/', PrivateModelCognitiveAnalyzeView.as_view(), name='private-model-analyze'),
    path('simulation/private-model/chat/', PrivateModelCopilotChatView.as_view(), name='private-model-chat'),
    path('simulation/private-model/status/', PrivateModelStatusView.as_view(), name='private-model-status'),

    # Device & Node Management Endpoints
    path('nodes/', DeviceListView.as_view(), name='device-list'),
    path('nodes/<str:node_id>/', DeviceDetailView.as_view(), name='device-detail'),

    # BRSKI (RFC 8995) Endpoints
    path('brski/voucher-request/', BRSKIVoucherRequestView.as_view(), name='brski-voucher-request'),
    path('brski/est-enroll/', BRSKIESTEnrollView.as_view(), name='brski-est-enroll'),

    # System Logs & Audit Trail Endpoints
    path('logs/', AuditLogsListView.as_view(), name='audit-logs-list'),
]


