import type { DatasetCore, DatasetPreprocessingGuide } from '@/types/datasets';

export function generatePreprocessingSnippets(dataset: DatasetCore): DatasetPreprocessingGuide[] {
  const id = dataset.external_dataset_id || dataset.huggingface_url?.split('/datasets/')[1] || dataset.slug;
  const name = dataset.name;

  return [
    {
      id: 'hf',
      title: 'Hugging Face Datasets',
      language: 'python',
      framework: 'datasets',
      tier: 'Quick Start',
      code: `from datasets import load_dataset\nds = load_dataset("${id}")\nprint(ds)\nprint(ds["train"][0] if "train" in ds else list(ds.values())[0][0])\n`,
    },
    {
      id: 'pandas',
      title: 'Pandas CSV load',
      language: 'python',
      framework: 'pandas',
      tier: 'Beginner',
      code: `import pandas as pd\n# Replace path after download\ndf = pd.read_csv("data/${dataset.slug}.csv")\nprint(df.head())\nprint(df.isna().mean())\n`,
    },
    {
      id: 'torch',
      title: 'PyTorch Dataset stub',
      language: 'python',
      framework: 'pytorch',
      tier: 'Intermediate',
      code: `from torch.utils.data import Dataset, DataLoader\n\nclass ${name.replace(/[^a-zA-Z0-9]/g, '') || 'Ht'}Torch(Dataset):\n    def __init__(self, rows):\n        self.rows = rows\n    def __len__(self):\n        return len(self.rows)\n    def __getitem__(self, i):\n        return self.rows[i]\n\nloader = DataLoader(${name.replace(/[^a-zA-Z0-9]/g, '') || 'Ht'}Torch([]), batch_size=32, shuffle=True)\n`,
    },
    {
      id: 'tf',
      title: 'TensorFlow pipeline sketch',
      language: 'python',
      framework: 'tensorflow',
      tier: 'Intermediate',
      code: `import tensorflow as tf\n# After local download\nds = tf.data.Dataset.list_files("data/${dataset.slug}/*")\nds = ds.shuffle(1000).batch(32).prefetch(tf.data.AUTOTUNE)\n`,
    },
    {
      id: 'albumentations',
      title: 'Albumentations / OpenCV',
      language: 'python',
      framework: 'albumentations',
      tier: 'Augmentation',
      code: `import albumentations as A\ntransform = A.Compose([A.HorizontalFlip(p=0.5), A.RandomBrightnessContrast(p=0.2)])\n# image = transform(image=image)["image"]\n`,
    },
    {
      id: 'spark',
      title: 'Spark / Parquet',
      language: 'python',
      framework: 'spark',
      tier: 'Enterprise',
      code: `from pyspark.sql import SparkSession\nspark = SparkSession.builder.appName("${dataset.slug}").getOrCreate()\ndf = spark.read.parquet("s3://bucket/${dataset.slug}/")\ndf.printSchema()\n`,
    },
  ];
}
