/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import {set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
    warn,
    extend,
    nextTick,
    mergeOptions,
    defineReactive
} from '../util/index'

export function initGlobalAPI(Vue: GlobalAPI) {
    // config
    const configDef = {}
    configDef.get = () => config
    if (process.env.NODE_ENV !== 'production') {
        configDef.set = () => {
            warn(
                'Do not replace the Vue.config object, set individual fields instead.'
            )
        }
    }
    // 初始化 Vue.config 对象
    Object.defineProperty(Vue, 'config', configDef)

    // exposed util methods.
    // NOTE: these are not considered part of the public API - avoid relying on
    // them unless you are aware of the risk.
    Vue.util = {
        warn,
        extend,
        mergeOptions,
        defineReactive
    }

    Vue.set = set
    Vue.delete = del
    Vue.nextTick = nextTick

    // 2.6 explicit observable API
    Vue.observable = < T > (obj: T): T => {
        observe(obj)
        return obj
    }

    Vue.options = Object.create(null)
    ASSET_TYPES.forEach(type => {
        Vue.options[type + 's'] = Object.create(null)
    })

    // this is used to identify the "base" constructor to extend all plain-object
    // components with in Weex's multi-instance scenarios.
    Vue.options._base = Vue

    extend(Vue.options.components, builtInComponents)
        // 注册 Vue.use(),用来注册插件
    initUse(Vue)
        // 注册 Vue.mixin() 实现混入    
    initMixin(Vue)
        // 注册 Vue.extend() 基于传入的 options 返回一个组件的构造函数
    initExtend(Vue)
        // 注册 Vue.directive()、Vue.component()、Vue.filter()
    initAssetRegisters(Vue)
}