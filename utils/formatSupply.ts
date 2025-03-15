export const formatSupply = (supply: number | string, decimals: number): string => {
    const supplyBig = BigInt(supply);
    const divisor = BigInt(10) ** BigInt(11); // Change to 11 to get the correct division
    const adjustedSupplyBig = supplyBig / divisor;
    const adjustedSupply = Number(adjustedSupplyBig);

    // Format to millions
    return `${adjustedSupply / 1000000}M`;
};