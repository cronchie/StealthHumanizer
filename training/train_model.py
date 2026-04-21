from transformers import T5Tokenizer, T5ForConditionalGeneration, Trainer, TrainingArguments
from datasets import Dataset

# Example dataset (replace with real dataset)
data = {
    "input_text": [
        "rewrite: This is important research",
        "rewrite: AI improves many systems"
    ],
    "target_text": [
        "This is crucial research",
        "AI enhances numerous systems"
    ]
}

# Create dataset
dataset = Dataset.from_dict(data)

tokenizer = T5Tokenizer.from_pretrained("t5-small")

# Preprocessing
def preprocess(example):
    inputs = tokenizer(example["input_text"], truncation=True, padding="max_length")
    targets = tokenizer(example["target_text"], truncation=True, padding="max_length")
    inputs["labels"] = targets["input_ids"]
    return inputs

train_dataset = dataset.map(preprocess)

model = T5ForConditionalGeneration.from_pretrained("t5-small")

training_args = TrainingArguments(
    output_dir="./model",
    per_device_train_batch_size=2,
    num_train_epochs=1,
    logging_steps=1,
    save_steps=10
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset
)

trainer.train()

# Save model
model.save_pretrained("./model")
tokenizer.save_pretrained("./model")

print("Model training complete and saved to ./model")
