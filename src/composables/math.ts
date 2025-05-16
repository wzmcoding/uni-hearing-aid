import Decimal from 'decimal.js'

export const math = {
  mul(...nums: number[]) {
    return nums.reduce(
      (m, n) => new Decimal(m).mul(new Decimal(n)).toNumber(),
      1,
    )
  },
  div(...nums: number[]) {
    return nums.reduce(
      (m, n, i) => (i === 0 ? n : new Decimal(m).div(new Decimal(n)).toNumber()),
      1,
    )
  },
  accurate(number: number, accuracy: number) {
    // return parseFloat(number.toFixed(accuracy));
    const a = 10 ** accuracy
    const b = math.mul(number, a)
    const c = Math.round(b)
    return math.div(c, 10 ** accuracy)
  },
}
