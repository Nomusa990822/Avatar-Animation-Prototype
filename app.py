from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


def interpret_command(command: str) -> dict:
    text = command.lower().strip()

    rules = [
    {
        "keywords": ["wave", "hello", "hi"],
        "intent": "wave",
        "animation": "wave",
        "explanation": "The avatar waves to greet the user."
    },
    {
        "keywords": ["walk", "forward", "move"],
        "intent": "walk_forward",
        "animation": "walk",
        "explanation": "The avatar walks forward."
    },
    {
        "keywords": ["back", "backward"],
        "intent": "walk_backward",
        "animation": "walk",
        "explanation": "The avatar walks backward."
    },
    {
        "keywords": ["left"],
        "intent": "point_left",
        "animation": "point",
        "explanation": "The avatar points left."
    },
    {
        "keywords": ["right"],
        "intent": "point_right",
        "animation": "point",
        "explanation": "The avatar points right."
    },
    {
        "keywords": ["clap"],
        "intent": "clap",
        "animation": "clap",
        "explanation": "The avatar claps."
    }
    ]

    for rule in rules:
        for keyword in rule["keywords"]:
            if keyword in text:
                return {
                    "success": True,
                    "intent": rule["intent"],
                    "animation": rule["animation"],
                    "explanation": rule["explanation"],
                    "original_command": command
                }

    return {
        "success": False,
        "intent": "unknown",
        "animation": "idle",
        "explanation": "The system could not confidently match that command, so the avatar remains idle.",
        "original_command": command
    }


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/interpret", methods=["POST"])
def interpret():
    data = request.get_json(silent=True) or {}
    command = data.get("command", "").strip()

    if not command:
        return jsonify({
            "success": False,
            "intent": "empty",
            "animation": "idle",
            "explanation": "Please enter a command for the avatar.",
            "original_command": command
        })

    result = interpret_command(command)
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=True)
