// AI模型相关常量定义
// AI模型相关枚举定义

// 模型供应商枚举
export const ModelBaseTypeEnum = {
  DeepSeek: 'DeepSeek',
  ZhiPuAI: 'ZhiPu AI', // 智谱 AI
  OpenAI: 'Open AI',
  SiliconFlow: 'SiliconFlow' // 硅基流动
}

// 模型类型枚举
export const ModelTypeEnum = {
  LLM: 'LLM', // 大语言
  VISION: 'VISION', // 视觉
  AUDIO: 'AUDIO', // 音频
  EMBEDDING: 'EMBEDDING' // 嵌入（向量化）
}

// 模型权限类型枚举
export const ModelPermissionTypeEnum = {
  PUBLIC: 'PUBLIC', // 公有
  PRIVATE: 'PRIVATE' // 私有
}

// 模型所有者类型枚举
export const ModelOwnerTypeTypeEnum = {
  SYSTEM: 'SYSTEM', // 系统
  PERSONAL: 'PERSONAL' // 个人
}

// 模型类型选项（显示用）
export const modelTypeOptions = [
  {
    label: '大语言模型',
    value: 'LLM'
  },
  {
    label: '视觉模型',
    value: 'VISION'
  },
  {
    label: '嵌入模型',
    value: 'EMBEDDING'
  }
]

// 基础模型类型映射
export const baseModelTypeMap = {
  [ModelBaseTypeEnum.DeepSeek]: [
    {
      value: 'deepseek-chat',
      label: 'deepseek-chat',
      tooltip: 'DeepSeek Chat模型，适用于对话场景',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'deepseek-reasoner',
      label: 'deepseek-reasoner',
      tooltip: 'DeepSeek推理模型，适用于复杂推理场景',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    }
  ],
  [ModelBaseTypeEnum.ZhiPuAI]: [
    {
      value: 'glm-4-plus',
      label: 'glm-4-plus',
      tooltip: '智谱AI GLM-4 Plus模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'glm-4-air-250414',
      label: 'glm-4-air-250414',
      tooltip: '智谱AI GLM-4 Air模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'glm-4-long',
      label: 'glm-4-long',
      tooltip: '智谱AI GLM-4 Long上下文模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'glm-4-airx',
      label: 'glm-4-airx',
      tooltip: '智谱AI GLM-4 AirX模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'glm-4-flashx',
      label: 'glm-4-flashx',
      tooltip: '智谱AI GLM-4 FlashX模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'glm-4-flash-250414',
      label: 'glm-4-flash-250414',
      tooltip: '智谱AI GLM-4 Flash模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'glm-4v-plus-0111',
      label: 'glm-4v-plus-0111',
      tooltip: '智谱AI GLM-4V Plus视觉模型',
      supportChat: true,
      supportVision: true,
      supportEmbedding: false
    }
  ],
  [ModelBaseTypeEnum.OpenAI]: [
    {
      value: 'gpt-3.5-turbo',
      label: 'gpt-3.5-turbo',
      tooltip: 'OpenAI GPT-3.5 Turbo模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'gpt-3.5-turbo-0125',
      label: 'gpt-3.5-turbo-0125',
      tooltip: 'OpenAI GPT-3.5 Turbo 0125版本',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'gpt-3.5-turbo-1106',
      label: 'gpt-3.5-turbo-1106',
      tooltip: 'OpenAI GPT-3.5 Turbo 1106版本',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'gpt-3.5-turbo-0613',
      label: 'gpt-3.5-turbo-0613',
      tooltip: 'OpenAI GPT-3.5 Turbo 0613版本',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'gpt-4',
      label: 'gpt-4',
      tooltip: 'OpenAI GPT-4模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'gpt-4-turbo',
      label: 'gpt-4-turbo',
      tooltip: 'OpenAI GPT-4 Turbo模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'gpt-4o-mini',
      label: 'gpt-4o-mini',
      tooltip: 'OpenAI GPT-4o Mini模型',
      supportChat: true,
      supportVision: true,
      supportEmbedding: false
    },
    {
      value: 'gpt-4-turbo-preview',
      label: 'gpt-4-turbo-preview',
      tooltip: 'OpenAI GPT-4 Turbo预览版',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'gpt-4o-2024-05-13',
      label: 'gpt-4o-2024-05-13',
      tooltip: 'OpenAI GPT-4o 2024-05-13版本',
      supportChat: true,
      supportVision: true,
      supportEmbedding: false
    },
    {
      value: 'gpt-4-turbo-2024-04-09',
      label: 'gpt-4-turbo-2024-04-09',
      tooltip: 'OpenAI GPT-4 Turbo 2024-04-09版本',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'gpt-4-0125-preview',
      label: 'gpt-4-0125-preview',
      tooltip: 'OpenAI GPT-4 0125预览版',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'gpt-4-1106-preview',
      label: 'gpt-4-1106-preview',
      tooltip: 'OpenAI GPT-4 1106预览版',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    }
  ],
  [ModelBaseTypeEnum.SiliconFlow]: [
    // === 现有模型 ===
    {
      value: 'Qwen/Qwen2.5-7B-Instruct',
      label: 'Qwen2.5-7B-Instruct',
      tooltip: '通义千问2.5 7B指令模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'Qwen/Qwen2.5-14B-Instruct',
      label: 'Qwen2.5-14B-Instruct',
      tooltip: '通义千问2.5 14B指令模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'Qwen/Qwen2.5-32B-Instruct',
      label: 'Qwen2.5-32B-Instruct',
      tooltip: '通义千问2.5 32B指令模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'Pro/Qwen/Qwen2.5-72B-Instruct',
      label: 'Qwen2.5-72B-Instruct (Pro)',
      tooltip: '通义千问2.5 72B指令模型 Pro版本',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'deepseek-ai/DeepSeek-V3',
      label: 'DeepSeek-V3',
      tooltip: 'DeepSeek V3 对话模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'THUDM/glm-4-9b-chat',
      label: 'GLM-4-9B-Chat',
      tooltip: '智谱AI GLM-4 9B对话模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'meta-llama/Llama-3.3-70B-Instruct',
      label: 'Llama-3.3-70B-Instruct',
      tooltip: 'Meta Llama 3.3 70B指令模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },

    // === 新增模型 ===
    {
      value: 'deepseek-ai/DeepSeek-R1',
      label: 'DeepSeek-R1',
      tooltip: 'DeepSeek R1 推理增强对话模型',
      supportChat: true,
      supportVision: false,
      supportEmbedding: false
    },
    {
      value: 'Qwen/Qwen3-VL-235B-A22B-Thinking',
      label: 'Qwen3-VL-235B-A22B-Thinking',
      tooltip: '通义千问3 235B视觉语言思维模型',
      supportChat: true,
      supportVision: true,
      supportEmbedding: false
    },
    {
      value: 'Qwen/Qwen3-VL-30B-A3B-Instruct',
      label: 'Qwen3-VL-30B-A3B-Instruct',
      tooltip: '通义千问3 30B视觉语言指令模型',
      supportChat: true,
      supportVision: true,
      supportEmbedding: false
    },
    {
      value: 'THUDM/GLM-4.1V-9B-Thinking',
      label: 'GLM-4.1V-9B-Thinking',
      tooltip: '智谱AI GLM-4.1V 9B视觉思维模型',
      supportChat: true,
      supportVision: true,
      supportEmbedding: false
    },
    {
      value: 'BAAI/bge-m3',
      label: 'BGE-M3',
      tooltip: 'BAAI BGE-M3 多语言嵌入模型',
      supportChat: false,
      supportVision: false,
      supportEmbedding: true
    },
    {
      value: 'Qwen/Qwen3-Embedding-8B',
      label: 'Qwen3-Embedding-8B',
      tooltip: '通义千问3 8B嵌入模型',
      supportChat: false,
      supportVision: false,
      supportEmbedding: true
    },
    {
      value: 'Qwen/Qwen3-Embedding-4B',
      label: 'Qwen3-Embedding-4B',
      tooltip: '通义千问3 4B嵌入模型',
      supportChat: false,
      supportVision: false,
      supportEmbedding: true
    },
    {
      value: 'Qwen/Qwen3-Embedding-0.6B',
      label: 'Qwen3-Embedding-0.6B',
      tooltip: '通义千问3 0.6B轻量嵌入模型',
      supportChat: false,
      supportVision: false,
      supportEmbedding: true
    }
  ]
  // 支持上述4个厂商
}

// DeepSeek推理模型默认参数
export const DEEP_SEEK_REASONER = [
  {
    name: 'max_tokens',
    label: '最大Token数',
    value: 4000,
    enable: true,
    minValue: 1,
    maxValue: 8000
  },
  {
    name: 'top_p',
    label: 'Top P',
    value: 1.0,
    enable: true,
    minValue: 0.1,
    maxValue: 1
  }
]

// DeepSeek对话模型默认参数
export const DEEP_SEEK_CHAT = [
  {
    name: 'frequency_penalty',
    label: '频率惩罚',
    value: 0,
    enable: true,
    minValue: -2.0,
    maxValue: 2.0
  },
  {
    name: 'max_tokens',
    label: '最大Token数',
    value: 4096,
    enable: true,
    minValue: 1.0,
    maxValue: 8192
  },
  {
    name: 'temperature',
    label: '温度',
    value: 1,
    enable: true,
    minValue: 0,
    maxValue: 2
  },
  {
    name: 'top_p',
    label: 'Top P',
    value: 1,
    enable: true,
    minValue: 0.1,
    maxValue: 1
  }
]

// 默认高级参数配置映射
export const defaultAdvancedSetValueMap = {
  [ModelBaseTypeEnum.DeepSeek]: [],
  [ModelBaseTypeEnum.OpenAI]: [
    {
      name: 'max_tokens',
      label: '最大Token数',
      value: 1000,
      enable: true,
      minValue: 1,
      maxValue: 8000
    },
    {
      name: 'temperature',
      label: '温度',
      value: 0.8,
      enable: true,
      minValue: 0,
      maxValue: 2
    },
    {
      name: 'top_p',
      label: 'Top P',
      value: 1,
      enable: true,
      minValue: 0.1,
      maxValue: 1
    }
  ],
  [ModelBaseTypeEnum.ZhiPuAI]: [
    {
      name: 'temperature',
      label: '温度',
      value: 0.75,
      enable: true,
      minValue: 0,
      maxValue: 1
    },
    {
      name: 'top_p',
      label: 'Top P',
      value: 1,
      enable: true,
      minValue: 0.1,
      maxValue: 1
    },
    {
      name: 'max_tokens',
      label: '最大Token数',
      value: 4000,
      enable: true,
      minValue: 1,
      maxValue: 8000
    }
  ],
  [ModelBaseTypeEnum.SiliconFlow]: [
    {
      name: 'temperature',
      label: '温度',
      value: 0.7,
      enable: true,
      minValue: 0,
      maxValue: 2
    },
    {
      name: 'top_p',
      label: 'Top P',
      value: 1.0,
      enable: true,
      minValue: 0,
      maxValue: 1
    },
    {
      name: 'max_tokens',
      label: '最大Token数',
      value: 4096,
      enable: true,
      minValue: 1,
      maxValue: 32768
    }
  ]
}

// 供应商模型列表
export const modelList = [
  {
    value: ModelBaseTypeEnum.DeepSeek,
    name: 'DeepSeek',
    icon: 'deepSeek'
  },
  {
    value: ModelBaseTypeEnum.OpenAI,
    name: 'OpenAI',
    icon: 'openAi'
  },
  {
    value: ModelBaseTypeEnum.ZhiPuAI,
    name: '智谱AI',
    icon: 'zhiPuAi'
  },
  {
    value: ModelBaseTypeEnum.SiliconFlow,
    name: '硅基流动',
    icon: 'siliconflow'
  }
]
