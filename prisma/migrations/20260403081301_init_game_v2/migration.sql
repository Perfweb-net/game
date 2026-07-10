-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "maxWave" INTEGER NOT NULL DEFAULT 0,
    "damageLevel" INTEGER NOT NULL DEFAULT 1,
    "fusionLimitLevel" INTEGER NOT NULL DEFAULT 1,
    "coffeeStartLevel" INTEGER NOT NULL DEFAULT 1,
    "enemyKills" TEXT NOT NULL DEFAULT '{}',
    "towersBuilt" TEXT NOT NULL DEFAULT '{}',
    "discoveredEnemies" TEXT NOT NULL DEFAULT '[]',
    "discoveredTowers" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
