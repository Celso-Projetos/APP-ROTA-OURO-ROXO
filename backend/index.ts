import { db, error, json, requireAuth, router, storage } from '@appdeploy/sdk';

type Visit = {
  id: string;
  date: string;
  seller: string;
  plannedRoute: string;
  customer: string;
  placeVisited?: string;
  status: string;
  order: boolean;
  revenue: number;
  notes?: string;
  latitude?: number;
  longitude?: number;
  locationAt?: string;
  checkInAt?: string;
  visitPhoto?: { path: string; contentType: string };
  orderPhoto?: { path: string; contentType: string };
  registeredBy?: string;
};
function tableFor() {
  return 'visits_team';
}
function valid(v: Visit) {
  return (
    typeof v.id === 'string' &&
    /^[A-Za-z0-9_-]{1,80}$/.test(v.id) &&
    typeof v.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.date) &&
    typeof v.seller === 'string' &&
    v.seller.length < 100 &&
    typeof v.customer === 'string' &&
    v.customer.trim().length > 0 &&
    v.customer.length < 200 &&
    typeof v.plannedRoute === 'string' &&
    v.plannedRoute.length < 500 &&
    ['Realizada', 'Cliente inativo', 'Não atendido', 'Remarcada'].includes(
      v.status
    ) &&
    typeof v.order === 'boolean' &&
    Number.isFinite(v.revenue) &&
    v.revenue >= 0 &&
    (v.latitude === undefined ||
      (Number.isFinite(v.latitude) && v.latitude >= -90 && v.latitude <= 90)) &&
    (v.longitude === undefined ||
      (Number.isFinite(v.longitude) &&
        v.longitude >= -180 &&
        v.longitude <= 180))
  );
}
export const handler = router({
  'GET /api/visits': [
    requireAuth(),
    async () => {
      const result = await db.list<Visit>(tableFor(), { limit: 200 });
      const items = await Promise.all(result.items.map(async visit => {
        const photos = [visit.visitPhoto, visit.orderPhoto].filter(Boolean) as Array<{ path: string; contentType: string }>;
        const urls = photos.length ? await storage.url(photos.map(photo => photo.path)) : [];
        let urlIndex = 0;
        return {
          ...visit,
          ...(visit.visitPhoto ? { visitPhotoUrl: urls[urlIndex++]?.url } : {}),
          ...(visit.orderPhoto ? { orderPhotoUrl: urls[urlIndex]?.url } : {}),
        };
      }));
      return json(items);
    },
  ],
  'POST /api/visits': [
    requireAuth(),
    async ({ user, body }) => {
      const payload = body as Visit & { photos?: { visit?: string; order?: string } };
      const visit = payload;
      if (!visit || !valid(visit))
        return error('Confira os campos do registro.', 400);
      if (!visit.checkInAt || !visit.latitude || !visit.longitude)
        return error('Faça o check-in com GPS antes de salvar.', 400);
      const prefix = 'visits/' + visit.id;
      const photoEntries: Array<{ path: string; content: string; contentType: string }> = [];
      if (payload.photos?.visit) photoEntries.push({ path: prefix + '/visita.jpg', content: payload.photos.visit, contentType: 'image/jpeg' });
      if (payload.photos?.order) photoEntries.push({ path: prefix + '/pedido.jpg', content: payload.photos.order, contentType: 'image/jpeg' });
      const uploaded = photoEntries.length ? await storage.write(photoEntries) : [];
      if (uploaded.some(ok => !ok)) return error('Não foi possível salvar as fotos. Tente novamente.', 500);
      const savedVisit: Visit = {
        ...visit,
        ...(payload.photos?.visit ? { visitPhoto: { path: prefix + '/visita.jpg', contentType: 'image/jpeg' } } : {}),
        ...(payload.photos?.order ? { orderPhoto: { path: prefix + '/pedido.jpg', contentType: 'image/jpeg' } } : {}),
        registeredBy: user?.email || user?.name || user!.userId,
      };
      const [id] = await db.tx.add(tableFor(), [
        { ...savedVisit, savedAt: new Date().toISOString() },
      ]);
      if (!id)
        return error(
          'Este registro já existe. Atualize a tela e tente novamente.',
          409
        );
      return json(savedVisit, 201);
    },
  ],
  'DELETE /api/visits/:id': [
    requireAuth(),
    async ({ user, params }) => {
      if (!/^[A-Za-z0-9_-]{1,80}$/.test(params.id))
        return error('Registro inválido.', 400);
      const [deleted] = await db.delete(tableFor(), [params.id]);
      if (!deleted) return error('Registro não encontrado.', 404);
      await storage.delete(['visits/' + params.id + '/visita.jpg', 'visits/' + params.id + '/pedido.jpg']);
      return json({ deleted: true });
    },
  ],
});
