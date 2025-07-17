-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rushmoreId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hideReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_rushmoreId_fkey" FOREIGN KEY ("rushmoreId") REFERENCES "Rushmore" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reporterId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "rushmoreId" TEXT,
    "commentId" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resolution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_rushmoreId_fkey" FOREIGN KEY ("rushmoreId") REFERENCES "Rushmore" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rushmore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "item1" TEXT NOT NULL,
    "item2" TEXT NOT NULL,
    "item3" TEXT NOT NULL,
    "item4" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hideReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rushmore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Rushmore_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Rushmore" ("createdAt", "id", "item1", "item2", "item3", "item4", "questionId", "userId") SELECT "createdAt", "id", "item1", "item2", "item3", "item4", "questionId", "userId" FROM "Rushmore";
DROP TABLE "Rushmore";
ALTER TABLE "new_Rushmore" RENAME TO "Rushmore";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "hashedPassword" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "hashedPassword", "id", "image", "name") SELECT "createdAt", "email", "hashedPassword", "id", "image", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
