import { and, asc, desc, eq, like, or, sql, type SQL } from 'drizzle-orm';
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

export type ProjectFilters = {
  status?: ProjectStatus | null;
  search?: string;
};

function buildProjectWhere({ status, search }: ProjectFilters) {
  const conditions: (SQL | undefined)[] = [];

  if (status) conditions.push(eq(projects.status, status));

  const keyword = search?.trim();
  if (keyword) {
    const pattern = `%${keyword}%`;
    conditions.push(
      or(
        like(projects.name, pattern),
        like(projects.maker, pattern),
        like(projects.scale, pattern),
      ),
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export function useProjectList(filters: ProjectFilters = {}) {
  const { status, search } = filters;

  return useLiveQuery(
    db
      .select({
        id: projects.id,
        name: projects.name,
        maker: projects.maker,
        scale: projects.scale,
        status: projects.status,
        quantity: projects.quantity,
        price: projects.price,
        location: projects.location,
        purchasedAt: projects.purchasedAt,
        coverUri: projects.coverUri,
        startedAt: projects.startedAt,
        finishedAt: projects.finishedAt,
        paintCount: sql<number>`(
          select count(*) from ${projectPaints} where ${projectPaints.projectId} = ${projects.id}
        )`,
      })
      .from(projects)
      .where(buildProjectWhere(filters))
      .orderBy(desc(projects.updatedAt)),
    [status, search],
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
        unbuilt: sql<number>`sum(case when ${projects.status} = 'unbuilt' then 1 else 0 end)`,
        inProgress: sql<number>`sum(case when ${projects.status} in ('building','painting','finishing') then 1 else 0 end)`,
        done: sql<number>`sum(case when ${projects.status} = 'done' then 1 else 0 end)`,
        kits: sql<number>`coalesce(sum(${projects.quantity}), 0)`,
        spent: sql<number>`coalesce(sum(${projects.price} * ${projects.quantity}), 0)`,
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
