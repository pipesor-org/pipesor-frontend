import { monitoredPipelinesSchema } from "./schema";

// Inventory values mirror exploration A.2; first owners/branch/filename mirror A.3.
// UUIDs and all other workflow paths/branches are synthetic, not GitHub identities.
// Missing owners mean unspecified, not unassigned incidents or missing permissions.
export const monitoredPipelines = monitoredPipelinesSchema.parse([
  {
    id: "b8c63000-0000-4000-8000-000000000001",
    slug: "deploy-production",
    github: {
      repository: "acme/payments-api", workflowName: "Deploy production",
      workflowPath: ".github/workflows/deploy-production.yml", defaultBranch: "main",
    },
    policy: { criticality: "Critical", monitoringStatus: "Active", operationalEnvironment: "Production" },
    ownership: { responsibleTeam: "Platform Engineering", pipelineOwners: ["Alex Chen", "Maya Patel"] },
  },
  {
    id: "b8c63000-0000-4000-8000-000000000002",
    slug: "build-and-test",
    github: {
      repository: "acme/web-storefront", workflowName: "Build and test",
      workflowPath: ".github/workflows/build-and-test.yml", defaultBranch: "main",
    },
    policy: { criticality: "Medium", monitoringStatus: "Active", operationalEnvironment: "Development" },
    ownership: { responsibleTeam: "Web Platform" },
  },
  {
    id: "b8c63000-0000-4000-8000-000000000003",
    slug: "quality-check",
    github: {
      repository: "acme/identity-api", workflowName: "Code quality checks",
      workflowPath: ".github/workflows/quality-check.yml", defaultBranch: "main",
    },
    policy: { criticality: "High", monitoringStatus: "Active", operationalEnvironment: "QA" },
    ownership: { responsibleTeam: "QA / DevOps" },
  },
  {
    id: "b8c63000-0000-4000-8000-000000000004",
    slug: "provision-infrastructure",
    github: {
      repository: "acme/platform-infra", workflowName: "Provision infrastructure",
      workflowPath: ".github/workflows/provision-infrastructure.yml", defaultBranch: "main",
    },
    policy: { criticality: "Critical", monitoringStatus: "Paused", operationalEnvironment: "Production" },
    ownership: { responsibleTeam: "Platform Engineering" },
  },
  {
    id: "b8c63000-0000-4000-8000-000000000005",
    slug: "build-container",
    github: {
      repository: "acme/worker-service", workflowName: "Build container image",
      workflowPath: ".github/workflows/build-container.yml", defaultBranch: "main",
    },
    policy: { criticality: "High", monitoringStatus: "Active", operationalEnvironment: "Production" },
    ownership: { responsibleTeam: "Platform Engineering" },
  },
  {
    id: "b8c63000-0000-4000-8000-000000000006",
    slug: "integration-tests",
    github: {
      repository: "acme/checkout-api", workflowName: "Integration tests",
      workflowPath: ".github/workflows/integration-tests.yml", defaultBranch: "main",
    },
    policy: { criticality: "High", monitoringStatus: "Active", operationalEnvironment: "QA" },
    ownership: { responsibleTeam: "QA / DevOps" },
  },
  {
    id: "b8c63000-0000-4000-8000-000000000007",
    slug: "build-documentation",
    github: {
      repository: "acme/docs-site", workflowName: "Build documentation",
      workflowPath: ".github/workflows/build-documentation.yml", defaultBranch: "main",
    },
    policy: { criticality: "Low", monitoringStatus: "Paused", operationalEnvironment: "Development" },
    ownership: { responsibleTeam: "Web Platform" },
  },
]);
