classdef Cat < Animal
    methods
        function obj = Cat(name, years)
            obj@Animal(name, years * 15, "Felidae", true);
        end
        function obj = noise(obj)
            handleCatNoiseKo(obj.Locale)
        end
        function obj = move(obj, meters)
            disp("Pussyfooting..");
            move@Animal(obj, meters / 2);
        end
        function obj = sleep(obj, multiplier)
            disp("Napping..");
            sleep@Animal(obj, multiplier * 16);
        end
    end
end

%% Test header folding and level=0&line!=0
function handleCatNoiseKo(locale)
    if strcmp(locale, "ko"); disp("Yaong"); else; disp("Meow"); end
end
