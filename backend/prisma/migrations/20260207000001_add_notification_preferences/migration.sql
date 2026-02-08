-- CreateTable
CREATE TABLE "NotificationPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailNewItem" BOOLEAN NOT NULL DEFAULT true,
    "emailMatchingInterest" BOOLEAN NOT NULL DEFAULT true,
    "emailMessages" BOOLEAN NOT NULL DEFAULT true,
    "emailTransactions" BOOLEAN NOT NULL DEFAULT true,
    "inAppNewItem" BOOLEAN NOT NULL DEFAULT true,
    "inAppMatchingInterest" BOOLEAN NOT NULL DEFAULT true,
    "inAppMessages" BOOLEAN NOT NULL DEFAULT true,
    "inAppTransactions" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_userId_key" ON "NotificationPreferences"("userId");

-- AddForeignKey
ALTER TABLE "NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
