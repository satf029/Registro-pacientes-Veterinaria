/*
  Warnings:

  - You are about to drop the `Dueno` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HistorialMedico` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Dueno" DROP CONSTRAINT "Dueno_personaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HistorialMedico" DROP CONSTRAINT "HistorialMedico_mascotaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Mascota" DROP CONSTRAINT "Mascota_duenoId_fkey";

-- DropTable
DROP TABLE "public"."Dueno";

-- DropTable
DROP TABLE "public"."HistorialMedico";

-- CreateTable
CREATE TABLE "public"."Propietario" (
    "id" SERIAL NOT NULL,
    "personaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Propietario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Propietario_personaId_key" ON "public"."Propietario"("personaId");

-- AddForeignKey
ALTER TABLE "public"."Propietario" ADD CONSTRAINT "Propietario_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "public"."Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mascota" ADD CONSTRAINT "Mascota_duenoId_fkey" FOREIGN KEY ("duenoId") REFERENCES "public"."Propietario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
