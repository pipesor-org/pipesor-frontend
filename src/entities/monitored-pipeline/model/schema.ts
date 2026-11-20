import { z } from "zod";

import {
  DEMO_OPERATIONAL_ENVIRONMENTS,
  PIPELINE_CRITICALITIES,
  PIPELINE_MONITORING_STATUSES,
} from "./types";

const nonBlankString = z.string().trim().min(1);
export const pipelineIdSchema = z.uuid().brand<"PipelineId">();

// Read-only source context; defaultBranch does not restrict monitoring coverage.
export const githubWorkflowReferenceSchema = z.strictObject({
  repository: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/),
  workflowName: nonBlankString,
  workflowPath: z.string().regex(/^\.github\/workflows\/[A-Za-z0-9_-][A-Za-z0-9_.-]*\.ya?ml$/),
  defaultBranch: nonBlankString,
}).readonly();

export const operationalPolicySchema = z.strictObject({
  criticality: z.enum(PIPELINE_CRITICALITIES),
  monitoringStatus: z.enum(PIPELINE_MONITORING_STATUSES),
  operationalEnvironment: z.enum(DEMO_OPERATIONAL_ENVIRONMENTS).optional(),
});

// Names describe operational ownership only, not authenticated users or grants.
export const pipelineOwnershipSchema = z.strictObject({
  responsibleTeam: nonBlankString,
  pipelineOwners: z.array(nonBlankString).optional(),
});

export const monitoredPipelineSchema = z.strictObject({
  id: pipelineIdSchema,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  github: githubWorkflowReferenceSchema,
  policy: operationalPolicySchema,
  ownership: pipelineOwnershipSchema,
}).readonly();

// Registration uniqueness includes Paused pipelines; route identity is separate.
export const monitoredPipelinesSchema = z.array(monitoredPipelineSchema)
  .superRefine((pipelines, context) => {
    const ids = new Set<string>();
    const registrations = new Set<string>();
    pipelines.forEach((pipeline, index) => {
      if (ids.has(pipeline.id)) {
        context.addIssue({ code: "custom", path: [index, "id"], message: "Duplicate pipeline identity" });
      }
      const key = `${pipeline.github.repository.toLowerCase()}/${pipeline.github.workflowPath}`;
      if (registrations.has(key)) {
        context.addIssue({ code: "custom", path: [index, "github"], message: "Workflow already registered" });
      }
      ids.add(pipeline.id);
      registrations.add(key);
    });
  });

export const syntheticWorkflowCatalogSchema = z.array(githubWorkflowReferenceSchema);

export type PipelineId = z.infer<typeof pipelineIdSchema>;
export type GitHubWorkflowReference = z.infer<typeof githubWorkflowReferenceSchema>;
export type OperationalPolicy = z.infer<typeof operationalPolicySchema>;
export type PipelineOwnership = z.infer<typeof pipelineOwnershipSchema>;
export type MonitoredPipeline = z.infer<typeof monitoredPipelineSchema>;
export type PipelineCriticality = OperationalPolicy["criticality"];
export type PipelineMonitoringStatus = OperationalPolicy["monitoringStatus"];
export type OperationalEnvironment = NonNullable<OperationalPolicy["operationalEnvironment"]>;
