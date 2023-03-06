function isObject(data) {
	return data && typeof data === 'object'
}


let targetMap = new WeakMap();
// new WeakMap<AnalyserNode,keyToDepMap>

let activeEffect;//副作用变量
/**
 * targetMap
 * {
 * target:{  //map()
 *     key:[activeEffect,activeEffect,....]
 * 
 * }
 * 
 */
// 在vue2中有一个全局变量，叫做Dep.target ---watcher

// 依赖的收集
// track里面会收集各种依赖，把依赖关系做成各种映射的关系，映射关系就叫 targetMap， 
// vue内部拿到这个key，就可以通过映射关系找到对应的value，就可以影响这个执行函数，
function track(target, key) {
	// 如果当前没有effect就不执行追踪
    if (!activeEffect) return 
	let depsMap = targetMap.get(target);
	if (!depsMap) targetMap.set(target, (depsMap = new Map()));
	//判断depsMap 中有没有key
	let dep = depsMap.get(key) 
	if (!dep) depsMap.set(key, (dep = new Set()))
	trackEffect(dep) 
}

function trackEffect(dep) {
	//相当于 Dep.target && dep.add(Dep.target)
	if (!dep.has(activeEffect)) dep.add(activeEffect);
}
// 触发
// 在影响的时候就通过 trigger目标对象找到key 根据映射关系找到cb函数执行更新视图。
// 小结一下，简单理解这里Proxy两个最重要的函数就是这里的track和trigger了，track主要就是收集依赖，将一层一层的关系做成了映射
// trigger就是执行依赖更新视图。
function trigger(target, key) {
	const depsMap = targetMap.get(target)
	console.log(depsMap,'depsMap')
	if (!depsMap) return
	depsMap.get(key).forEach(effect =>
		effect && effect.run()
	);
}

export function reactive(data) {
	if (!isObject(data)) return
	return new Proxy(data, { 
		get(target, key, receiver) {
			const ret = Reflect.get(target, key, receiver);
			track(target, key)
			return isObject(ret) ? reactive(ret) : ret
		},
		set(target, key, value,receiver) {
			Reflect.set(target, key, value, receiver)
			trigger(target, key)
			return true
		},
		deleteProperty(target, key) {
			const ret = Reflect.deleteProperty(target, key)
			trigger(target, key)
			return ret
		},
		has(target, key) {
			track(target, key)
			const ret = Reflect.has(target, key)
		},
		ownKeys(target, key) {
			track(target)
			return Reflect.ownKeys(targety)
		},
	})
}




//第一个参数是函数，如果这个函数中有使用 ref/reactive 对象，当这个值改变的时候effect就会执行
function effect(fn,option={}){
  let __effect = new ReactiveEffect(fn);
  console.log('111111111111111')
  if(!option.lazy){
	console.log('22222222')
	  __effect.run();
  }
  return __effect
}


// const m = computed(()=>`${num.value}!!!!!`)
export function computed(fn){
//只考虑函数情况
let __computed;
const e = effect(fn,{lazy:true })
__computed = {
	get value(){
		return e.run();
	}
}
return __computed
}

// instance相当于整个app el相当于挂在的节点
export function mount(instance,el){
	// console.log(instance,'instance')
	// console.log(el,'el')
	effect(function(){
		console.log('effecteffecteffecteffect')
		instance.$data && update(instance,el)
	})
	instance.$data = instance.setup();
	update(instance,el)
	function update(instance,el){
		// console.log(el,'el')
		// console.log(instance,'instance ')
		el.innerHTML = instance.render();
		// console.log(el.innerHtml,'el.innerHtml')
	}
}



class ReactiveEffect{
	constructor(fn){
		this.fn = fn;
	}
	// 依赖收集之前触发
	run(){
		activeEffect = this;
		return this.fn()
	}
}