# Discord Nerd

By Randy

To be honest, I'm not sure why I agreed to make this. Maybe I am a true nerd 🤓

# Docker Container? (Easiest Way)

```sh
docker pull ghcr.io/randy-halim/FILL_THIS:latest

# copy ".env.example" from the repo to your current working directory as ".env"
# fill out ".env" with your keys as needed

docker run -d \
  --env-file .env \
  ghcr.io/randy-halim/FILL_THIS:latest --register

# profit
```

# License

[MIT License](https://fcrh.mit-license.org/)
