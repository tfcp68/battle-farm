export default function arraySample<T>(arr:T[],n:number = 1,acc:T[] = []):T[]{
	if (n <= 0) return acc
	const i = Math.floor(Math.random()*arr.length)
	acc.push(arr[i])
	return arraySample(arr.filter((_,j) => j !== i),n-1,acc)
}