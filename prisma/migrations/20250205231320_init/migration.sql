-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('FUGA_DETECTADA', 'VENTILADOR_ENCENDIDO', 'VALVULA_CERRADA', 'SISTEMA_REESTABLECIDO');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" "RoleType" NOT NULL DEFAULT 'USER',

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "name_device" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Events" (
    "id" SERIAL NOT NULL,
    "event_type" "EventType" NOT NULL,
    "event_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gas_concentration" DECIMAL(65,30) NOT NULL,
    "device_id" INTEGER NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
