import { syntheticWorkflowCatalogSchema } from "./schema";

// Synthetic selection data, not discovered from GitHub. Names/repositories mirror
// exploration A.2–A.4; paths/branches are invented except the detail/Add examples.
export const syntheticWorkflowCatalog = syntheticWorkflowCatalogSchema.parse([
  {
    repository: "acme/payments-api",
    workflowName: "Deploy production",
    workflowPath: ".github/workflows/deploy-production.yml",
    defaultBranch: "main",
  },
  {
    repository: "acme/web-storefront",
    workflowName: "Build and test",
    workflowPath: ".github/workflows/build-and-test.yml",
    defaultBranch: "main",
  },
  {
    repository: "acme/identity-api",
    workflowName: "Code quality checks",
    workflowPath: ".github/workflows/quality-check.yml",
    defaultBranch: "main",
  },
  {
    repository: "acme/platform-infra",
    workflowName: "Provision infrastructure",
    workflowPath: ".github/workflows/provision-infrastructure.yml",
    defaultBranch: "main",
  },
  {
    repository: "acme/worker-service",
    workflowName: "Build container image",
    workflowPath: ".github/workflows/build-container.yml",
    defaultBranch: "main",
  },
  {
    repository: "acme/checkout-api",
    workflowName: "Integration tests",
    workflowPath: ".github/workflows/integration-tests.yml",
    defaultBranch: "main",
  },
  {
    repository: "acme/docs-site",
    workflowName: "Build documentation",
    workflowPath: ".github/workflows/build-documentation.yml",
    defaultBranch: "main",
  },
  {
    repository: "acme/reporting-service",
    workflowName: "Integration checks",
    workflowPath: ".github/workflows/integration-checks.yml",
    defaultBranch: "main",
  },
]);
