import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/app-layout.tsx", [
    index("routes/home.tsx"),
    route("jobs/upload", "routes/jobs.upload.tsx"),
    route("jobs/:jobId", "routes/jobs.$jobId.tsx"),
    route("jobs/:jobId/mapping", "routes/jobs.$jobId.mapping.tsx"),
    route("jobs/:jobId/validate", "routes/jobs.$jobId.validate.tsx"),
    route("jobs/:jobId/errors", "routes/jobs.$jobId.errors.tsx"),
    route("templates", "routes/templates.tsx"),
    route("templates/:templateId", "routes/templates.$templateId.tsx"),
    route("report-templates", "routes/report-templates.tsx"),
    route("report-templates/new", "routes/report-templates.new.tsx"),
    route("report-templates/:templateId", "routes/report-templates.$templateId.tsx"),
    route("report-jobs", "routes/report-jobs.tsx"),
    route("report-jobs/new", "routes/report-jobs.new.tsx"),
    route("report-jobs/:jobId", "routes/report-jobs.$jobId.tsx"),
  ]),
] satisfies RouteConfig;
