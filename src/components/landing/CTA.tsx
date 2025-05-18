import { useNavigate } from "@solidjs/router";
import { Button } from "../ui/button";


export default function CTA() {
    const navigate = useNavigate();

    return (
        <>
            <section class="py-20 bg-indigo-900 text-white">
                <div class="container mx-auto px-4 max-w-6xl text-center">
                    <h2 class="mb-6 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Готовы найти своего партнера для стартапа?</h2>
                    <p class="mb-8 max-w-2xl mx-auto text-xl md:text-2xl text-indigo-100 leading-relaxed">
                        Присоединяйтесь к сообществу разработчиков, которые строят будущее вместе
                    </p>
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => navigate("/login")}
                    >
                        Зарегистрироваться сейчас
                    </Button>
                </div>
            </section>

        </>
    );
} 