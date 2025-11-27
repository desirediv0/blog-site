import { prisma } from "@/lib/prisma";

// Store temp password in database (more reliable than in-memory)
// Note: We store plain password temporarily - it's deleted immediately after use

export async function getTempPasswordFromDB(
  email: string
): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        tempPassword: true,
        tempPasswordExpires: true,
      },
    });

    if (!user || !user.tempPassword || !user.tempPasswordExpires) {
      console.log(`[TempPassword] No temp password found in DB for ${email}`);
      return null;
    }

    if (user.tempPasswordExpires < new Date()) {
      console.log(`[TempPassword] Temp password expired for ${email}`);
      // Clean up expired password
      await prisma.user.update({
        where: { email },
        data: {
          tempPassword: null,
          tempPasswordExpires: null,
        },
      });
      return null;
    }

    console.log(`[TempPassword] Retrieved password from DB for ${email}`);
    return user.tempPassword;
  } catch (error) {
    console.error(
      `[TempPassword] Error getting temp password for ${email}:`,
      error
    );
    return null;
  }
}

export async function deleteTempPassword(email: string) {
  try {
    await prisma.user.update({
      where: { email },
      data: {
        tempPassword: null,
        tempPasswordExpires: null,
      },
    });
    console.log(`[TempPassword] Deleted temp password for ${email}`);
  } catch (error) {
    console.error(
      `[TempPassword] Error deleting temp password for ${email}:`,
      error
    );
  }
}
