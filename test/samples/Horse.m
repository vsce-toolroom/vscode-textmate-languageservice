classdef Horse < Animal
    methods
        function obj = Horse(name, years)
            obj@Animal(name, years * 6, "Equidae", true);
        end
        function obj = noise(obj)
            disp("Neigh");
        end
        function obj = move(obj, meters)
            if meters > 8
                disp("Galloping..");
            elseif meters > 4
                disp("Cantering..");
            else
                disp("Trotting..");
            end
            move@Animal(obj, meters * 5);
        end
        function obj = sleep(obj, multiplier)
            disp("Napping..");
            sleep@Animal(obj, multiplier * 16);
        end
    end
end
