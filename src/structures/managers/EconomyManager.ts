import type { User } from "@prisma/client";
import { container } from "@sapphire/framework";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EconomyManager {
  public static async getBankedBalance(id: string): Promise<number> {
    const data = await container.database.user.findUnique({
      where: { id },
    });

    if (!data) {
      await container.database.user.create({ data: { id } });
      return 0;
    }

    return data.bankedCoins;
  }

  public static async getBalance(id: string): Promise<number> {
    const data = await container.database.user.findUnique({
      where: { id },
    });

    if (!data) {
      await container.database.user.create({ data: { id } });
      return 0;
    }

    return data.coins;
  }

  public static async addCoins(id: string, coins: number): Promise<void> {
    let data = await container.database.user.findUnique({
      where: { id },
    });

    if (!data) data = await container.database.user.create({ data: { id } });

    await container.database.user.update({
      where: { id },
      data: { coins: data.coins + coins },
    });
  }

  public static async removeCoins(id: string, coins: number): Promise<void> {
    let data: User | null = await container.database.user.findUnique({
      where: { id },
    });

    if (!data) data = await container.database.user.create({ data: { id } });

    await container.database.user.update({
      where: { id },
      data: { coins: data.coins - coins },
    });
  }

  public static async depositCoins(
    id: string,
    coins: number
  ): Promise<number[] | boolean> {
    let data: User | null = await container.database.user.findUnique({
      where: { id },
    });

    if (!data) data = await container.database.user.create({ data: { id } });

    if (data.coins < coins) {
      return false;
    }

    await container.database.user.update({
      where: { id },
      data: {
        coins: data.coins - coins,
        bankedCoins: data.bankedCoins + coins,
      },
    });

    return [data.coins - coins, data.bankedCoins + coins];
  }

  public static async withdrawCoins(
    id: string,
    coins: number
  ): Promise<number[] | boolean> {
    let data: User | null = await container.database.user.findUnique({
      where: { id },
    });

    if (!data) data = await container.database.user.create({ data: { id } });

    if (data.bankedCoins < coins) {
      return false;
    }

    await container.database.user.update({
      where: { id },
      data: {
        coins: data.coins + coins,
        bankedCoins: data.bankedCoins - coins,
      },
    });

    return [data.coins + coins, data.bankedCoins - coins];
  }
}
