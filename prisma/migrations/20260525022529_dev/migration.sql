-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('VELOCITY', 'QUALITY', 'UPTIME', 'DEPLOYMENTS', 'COVERAGE');

-- CreateEnum
CREATE TYPE "BuildStatus" AS ENUM ('SUCCESS', 'FAILURE', 'PENDING', 'CANCELLED');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "repoUrl" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL,
    "type" "MetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "projectId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Build" (
    "id" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "branch" TEXT NOT NULL DEFAULT 'main',
    "status" "BuildStatus" NOT NULL,
    "duration" INTEGER,
    "commitSha" TEXT,
    "workspaceId" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_slug_idx" ON "Workspace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_workspaceId_idx" ON "User"("workspaceId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_workspaceId_idx" ON "Project"("workspaceId");

-- CreateIndex
CREATE INDEX "Metric_projectId_idx" ON "Metric"("projectId");

-- CreateIndex
CREATE INDEX "Metric_recordedAt_idx" ON "Metric"("recordedAt");

-- CreateIndex
CREATE INDEX "Build_workspaceId_idx" ON "Build"("workspaceId");

-- CreateIndex
CREATE INDEX "Build_triggeredAt_idx" ON "Build"("triggeredAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
