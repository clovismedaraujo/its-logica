FROM rasa/rasa:3.6.20-full

WORKDIR /app

COPY . .

RUN rasa train

CMD ["run", "--enable-api", "--cors", "*", "--port", "5005"]
