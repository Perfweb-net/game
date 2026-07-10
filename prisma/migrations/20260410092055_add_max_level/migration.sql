-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "maxWave" INTEGER NOT NULL DEFAULT 0,
    "maxLevel" INTEGER NOT NULL DEFAULT 1,
    "damageLevel" INTEGER NOT NULL DEFAULT 1,
    "fusionLimitLevel" INTEGER NOT NULL DEFAULT 1,
    "coffeeStartLevel" INTEGER NOT NULL DEFAULT 1,
    "enemyKills" TEXT NOT NULL DEFAULT '{}',
    "towersBuilt" TEXT NOT NULL DEFAULT '{}',
    "discoveredEnemies" TEXT NOT NULL DEFAULT '[]',
    "discoveredTowers" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("coffeeStartLevel", "createdAt", "credits", "damageLevel", "discoveredEnemies", "discoveredTowers", "enemyKills", "fusionLimitLevel", "id", "maxWave", "password", "towersBuilt", "username") SELECT "coffeeStartLevel", "createdAt", "credits", "damageLevel", "discoveredEnemies", "discoveredTowers", "enemyKills", "fusionLimitLevel", "id", "maxWave", "password", "towersBuilt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
