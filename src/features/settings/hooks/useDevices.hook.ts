import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/services/api';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showAlert, showConfirmation } from '@/shared/utils/confirmations';
import { fetchDevices, revokeDeviceById, type AccountDevice } from '../api/devices.api';

const DEVICES_QUERY_KEY = ['account-devices'];

export function useDevices() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: DEVICES_QUERY_KEY,
    queryFn: fetchDevices,
  });

  const revokeMutation = useMutation({
    mutationFn: revokeDeviceById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICES_QUERY_KEY });
    },
    onError: (err) => {
      showAlert('Could not sign out device', getApiErrorMessage(err));
    },
  });

  const confirmRevoke = (device: AccountDevice) => {
    showConfirmation(CONFIRM.revokeDevice(device.deviceName ?? 'This device'), async () => {
      await revokeMutation.mutateAsync(device.id);
    });
  };

  return {
    devices: query.data?.devices ?? [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    confirmRevoke,
    revokingId: revokeMutation.isPending ? revokeMutation.variables : null,
  };
}
