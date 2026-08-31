from rest_framework import serializers
from .models import NetworkDevice, NetworkConnection, AutonomicAgent, BRSKIVoucher, AuditLogEvent

class NetworkDeviceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='node_id', read_only=True)
    type = serializers.CharField(source='device_type')
    ip = serializers.CharField(source='ip_address')
    x = serializers.IntegerField(source='x_pos', required=False)
    y = serializers.IntegerField(source='y_pos', required=False)

    class Meta:
        model = NetworkDevice
        fields = [
            'id',
            'node_id',
            'name',
            'type',
            'device_type',
            'ip',
            'ip_address',
            'mac_address',
            'port_capacity',
            'status',
            'load',
            'x',
            'y',
            'x_pos',
            'y_pos',
            'is_custom',
            'created_at',
            'updated_at'
        ]


class NetworkConnectionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='link_id', read_only=True)
    source_id = serializers.CharField(source='source.node_id', read_only=True)
    target_id = serializers.CharField(source='target.node_id', read_only=True)

    class Meta:
        model = NetworkConnection
        fields = [
            'id',
            'link_id',
            'source',
            'target',
            'source_id',
            'target_id',
            'link_type',
            'traffic_level',
            'bandwidth_gbps',
            'is_active',
            'created_at'
        ]


class AutonomicAgentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='agent_id', read_only=True)
    risk = serializers.CharField(source='risk_level')

    class Meta:
        model = AutonomicAgent
        fields = [
            'id',
            'agent_id',
            'name',
            'role',
            'status',
            'task',
            'confidence',
            'risk',
            'risk_level',
            'color',
            'last_event',
            'capabilities',
            'updated_at'
        ]


class BRSKIVoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = BRSKIVoucher
        fields = '__all__'


class AuditLogEventSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='event_id', read_only=True)

    class Meta:
        model = AuditLogEvent
        fields = [
            'id',
            'event_id',
            'timestamp',
            'level',
            'source',
            'phase',
            'title',
            'message',
            'payload',
            'created_at'
        ]
