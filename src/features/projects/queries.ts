import { asc, desc, eq, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import {
  brands,
  paints,
  projectPaints,
  projects,
  type NewProject,
  type ProjectStatus,
} from '@/db/schema';

const ACTIVE_STATUSES: ProjectStatus[] = ['planned', 'building', 'painting', 'finishing'];

export function useProjectList(status?: ProjectStatus | null) {
  return useLiveQuery(
    db
      .select({
        id: projects.id,
        name: projects.name,
        maker: projects.maker,
        scale: projects.scale,
        status: projects.status,
        coverUri: projects.coverUri,
        startedAt: projects.startedAt,
        finishedAt: projects.finishedAt,
        paintCount: sql<number>`(
          select count(*) from ${projectPaints} where ${projectPaints.projectId} = ${projects.id}
        )`,
      })
      .from(projects)
      .where(status ? eq(projects.status, status) : undefined)
      .orderBy(desc(projects.updatedAt)),
    [status],
  );
}

export function useProject(id: number | null) {
  return useLiveQuery(
    db
      .select()
      .from(projects)
      .where(eq(projects.id, id ?? -1))
      .limit(1),
    [id],
  );
}

/** 킷에 등록된 도료 팔레트 (도료 정보 조인) */
export function useProjectPaints(projectId: number | null) {
  return useLiveQuery(
    db
      .select({
        id: projectPaints.id,
        part: projectPaints.part,
        mixRatio: projectPaints.mixRatio,
        paintId: paints.id,
        paintName: paints.name,
        paintCode: paints.code,
        colorHex: paints.colorHex,
        quantity: paints.quantity,
        brandName: brands.name,
      })
      .from(projectPaints)
      .innerJoin(paints, eq(projectPaints.paintId, paints.id))
      .leftJoin(brands, eq(paints.brandId, brands.id))
      .where(eq(projectPaints.projectId, projectId ?? -1))
      .orderBy(asc(projectPaints.id)),
    [projectId],
  );
}

export function useProjectSummary() {
  return useLiveQuery(
    db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`sum(case when ${projects.status} in ('planned','building','painting','finishing') then 1 else 0 end)`,
        done: sql<number>`sum(case when ${projects.status} = 'done' then 1 else 0 end)`,
      })
      .from(projects),
  );
}

export async function createProject(values: NewProject) {
  const [row] = await db
    .insert(projects)
    .values({ ...values, updatedAt: new Date() })
    .returning({ id: projects.id });
  return row.id;
}

export async function updateProject(id: number, values: Partial<NewProject>) {
  await db
    .update(projects)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  await db.delete(projects).where(eq(projects.id, id));
}

export async function addPaintToProject(projectId: number, paintId: number, part?: string) {
  await db
    .insert(projectPaints)
    .values({ projectId, paintId, part: part ?? null })
    .onConflictDoNothing();
}

export async function removePaintFromProject(projectPaintId: number) {
  await db.delete(projectPaints).where(eq(projectPaints.id, projectPaintId));
}

export { ACTIVE_STATUSES };
