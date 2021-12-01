classdef Dog < Animal
    methods
		function obj = Dog(name, years)
			obj@Animal(name, years * 15, "Canis", true);
		end
        function obj = noise(obj)
            disp("Woof");
        end
        function obj = move(obj, meters)
            disp("Pacing..");
            move@Animal(obj, meters / 3);
        end
        function obj = sleep(obj, multiplier)
            disp("Napping..");
            sleep@Animal(obj, multiplier * 12);
        end
    end
end
