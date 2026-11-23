import { useCallback } from 'react';
import useApi from '../../hooks/useApi';
import { workshopsApi } from '../../api';

/**
 * Data kegiatan Humas dari backend + aksi simpan/hapus/ubah status.
 * Payload simpan mengikuti form TambahKegiatanModal.
 */
export default function useKegiatan() {
  const { data, loading, error, reload } = useApi(() => workshopsApi.list(), [], []);

  const save = useCallback(async payload => {
    const saved = payload.id ? await workshopsApi.update(payload.id, payload) : await workshopsApi.create(payload);
    await reload();
    return saved;
  }, [reload]);

  const remove = useCallback(async id => {
    await workshopsApi.remove(id);
    await reload();
  }, [reload]);

  const setStatus = useCallback(async (id, status) => {
    await workshopsApi.setStatus(id, typeof status === 'string' ? { status } : status);
    await reload();
  }, [reload]);

  return { kegiatan: data || [], loading, error, reload, save, remove, setStatus };
}
