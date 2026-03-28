from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


def interpret_command(command: str) -> dict:
    text = command.lower().strip()

    rules = [
        {
            "keywords": ["wave", "hello", "hi", "greet"],
            "intent": "wave",
            "animation": "wave",
            "explanation": "The avatar performs a friendly wave to greet the learner."
        },
        {
            "keywords": ["walk forward", "move forward", "go forward", "ahead"],
            "intent": "walk_forward",
            "animation": "walk",
            "explanation": "The avatar walks forward to demonstrate movement."
        },
        {
            "keywords": ["walk backward", "move backward", "go back", "step back"],
            "intent": "walk_backward",
            "animation": "walk_back",
            "explanation": "The avatar moves backward in response to the command."
        },
        {
            "keywords": ["point left"],
            "intent": "point_left",
            "animation": "point_left",
            "explanation": "The avatar points to the left to indicate a direction or object."
        },
        {
            "keywords": ["point right"],
            "intent": "point_right",
            "animation": "point_right",
            "explanation": "The avatar points to the right to indicate a direction or object."
        },
        {
            "keywords": ["clap", "applaud"],
            "intent": "clap",
            "animation": "clap",
            "explanation": "The avatar claps to show approval or celebration."
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
    app.run(host="0.0.0.0", port=5001, debug=True)
