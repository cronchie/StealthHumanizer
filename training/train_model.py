from transformers import T5Tokenizer, T5ForConditionalGeneration, Trainer, TrainingArguments
from datasets import load_dataset

# Load dataset from generated file
dataset = load_dataset("text", data_files={"train": "dataset.txt"})

tokenizer = T5Tokenizer.from_pretrained("t5-small")

# Preprocessing
def preprocess(example):
    parts = example["text"].split("\t")
    if len(parts) != 2:
        return {}

    inp, tgt = parts
    inputs = tokenizer(inp, truncation=True, padding="max_length")
    targets = tokenizer(tgt, truncation=True, padding="max_length")
    inputs["labels"] = targets["input_ids"]
    return inputs

train_dataset = dataset["train"].map(preprocess)

model = T5ForConditionalGeneration.from_pretrained("t5-small")

training_args = TrainingArguments(
    output_dir="./model",
    per_device_train_batch_size=4,
    num_train_epochs=3,
    learning_rate=3e-4,
    logging_steps=10,
    save_steps=50
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset
)

trainer.train()

model.save_pretrained("./model")
tokenizer.save_pretrained("./model")

print("Training complete with optimized settings")
