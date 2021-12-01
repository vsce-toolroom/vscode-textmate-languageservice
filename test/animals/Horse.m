classdef Horse < Animal
    methods
		function obj = Horse(name, years)
			obj@Animal(name, years * 6, "Equidae", true);
		end
        function obj = noise(obj)
            disp("Neigh");
        end
        function obj = move(obj, meters)
            disp("Galloping..");
            move@Animal(obj, meters * 5);
        end
        function obj = sleep(obj, multiplier)
            disp("Napping..");
            sleep@Animal(obj, multiplier * 16);
        end
    end
end
