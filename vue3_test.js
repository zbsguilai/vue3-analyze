// 判断是否为对象 ，注意 null 也是对象
const isObject = val => val !== null && typeof val === 'object'
// 判断key是否存在
const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key)

export function reactive(target) {
	console.log(target,'target')
	// 首先先判断是否为对象
	if (!isObject(target)) return target

	const handler = {
		get(target, key, receiver) {
			console.log(`获取对象属性${key}值`)
			console.log(key,'key')
			console.log(receiver,'receiver')
			// ... 这里还需要收集依赖，先空着

			const result = Reflect.get(target, key, receiver)
			// 递归判断的关键, 如果发现子元素存在引用类型，递归处理。
			if (isObject(result)) {
				return reactive(result)
			}
			return result
		},

		set(target, key, value, receiver) {
			console.log(`设置对象属性${key}值`)

			// 首先先获取旧值
			const oldValue = Reflect.get(target, key, reactive)

			// set 是需要返回 布尔值的
			let result = true
			// 判断新值和旧值是否一样来决定是否更新setter
			if (oldValue !== value) {
				result = Reflect.set(target, key, value, receiver)
				// 更新操作 等下再补
			}
			return result
		},

		deleteProperty(target, key) {
			console.log(`删除对象属性${key}值`)

			// 先判断是否有key
			const hadKey = hasOwn(target, key)
			const result = Reflect.deleteProperty(target, key)

			if (hadKey && result) {
				// 更新操作 等下再补
			}

			return result
		},
	}
	return new Proxy(target, handler)
}