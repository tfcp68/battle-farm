export default function arraySample(arr:any[],n:number = 1,acc:any[] = []):any[]{
	if (n <= 0) return acc
	const i = Math.floor(Math.random()*arr.length)
	acc.push(arr[i])
	return arraySample(arr.filter((_,j) => j !== i),n-1,acc)
}